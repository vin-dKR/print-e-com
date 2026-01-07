'use client';

/**
 * Pricing Matrix Component
 * Table-based pricing UI that auto-generates rules
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert } from '@/app/components/ui/alert';
import {
    getCategorySpecificationsApi,
    getCategoryPricingRulesApi,
    createCategoryPricingRuleApi,
    updateCategoryPricingRuleApi,
    deleteCategoryPricingRuleApi,
    type CategorySpecification,
    type CategorySpecificationOption,
    type CategoryPricingRule,
} from '@/lib/api/categories.service';

interface PricingMatrixProps {
    categoryId: string;
}

interface MatrixCell {
    price: string;
    ruleId?: string; // If this price already has a rule
}

interface MatrixRow {
    paperType: CategorySpecificationOption;
    bwSingle: MatrixCell;
    bwBoth: MatrixCell;
    colorSingle: MatrixCell;
    colorBoth: MatrixCell;
}

export function PricingMatrix({ categoryId }: PricingMatrixProps) {
    const [specs, setSpecs] = useState<CategorySpecification[]>([]);
    const [rules, setRules] = useState<CategoryPricingRule[]>([]);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matrix, setMatrix] = useState<MatrixRow[]>([]);

    // Load specs and rules
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const [specifications, pricingRules] = await Promise.all([
                    getCategorySpecificationsApi(categoryId),
                    getCategoryPricingRulesApi(categoryId),
                ]);
                setSpecs(specifications);
                setRules(pricingRules);

                // Find size spec and set default
                const sizeSpec = specifications.find(
                    (s) => s.slug === 'size' || s.slug === 'paper-size'
                );
                if (sizeSpec && sizeSpec.options && sizeSpec.options.length > 0) {
                    setSelectedSize(sizeSpec.options[0]?.value || '');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [categoryId]);

    // Build matrix when size changes
    useEffect(() => {
        if (!selectedSize || specs.length === 0) return;

        const sizeSpec = specs.find((s) => s.slug === 'size' || s.slug === 'paper-size');
        const typeSpec = specs.find((s) => s.slug === 'type' || s.slug === 'paper-type');
        const colorSpec = specs.find((s) => s.slug === 'page-color' || s.slug === 'color');
        const sideSpec = specs.find((s) => s.slug === 'page-side' || s.slug === 'side');

        if (!typeSpec || !colorSpec || !sideSpec) return;

        // Filter type options by selected size (using metadata dependencies)
        const validTypeOptions = typeSpec.options.filter((opt) => {
            const metadata = opt.metadata as { allowedParentValues?: string[] } | null;
            if (!metadata?.allowedParentValues || metadata.allowedParentValues.length === 0) {
                return true; // No restriction, applies to all
            }
            return metadata.allowedParentValues.includes(selectedSize);
        });

        // Build matrix rows
        const newMatrix: MatrixRow[] = validTypeOptions.map((typeOpt) => {
            // Find existing rules for this combination
            const findRule = (color: string, side: string): MatrixCell => {
                const rule = rules.find((r) => {
                    const sv = r.specificationValues as Record<string, any>;
                    return (
                        sv.size === selectedSize &&
                        sv.type === typeOpt.value &&
                        sv['page-color'] === color &&
                        sv['page-side'] === side &&
                        r.ruleType === 'SPECIFICATION_COMBINATION'
                    );
                });
                return {
                    price: rule?.basePrice ? String(rule.basePrice) : '',
                    ruleId: rule?.id,
                };
            };

            return {
                paperType: typeOpt,
                bwSingle: findRule('bw', 'single'),
                bwBoth: findRule('bw', 'both'),
                colorSingle: findRule('color', 'single'),
                colorBoth: findRule('color', 'both'),
            } as MatrixRow;
        });

        setMatrix(newMatrix);
    }, [selectedSize, specs, rules]);

    const handleCellChange = (rowIndex: number, cellKey: 'bwSingle' | 'bwBoth' | 'colorSingle' | 'colorBoth', value: string) => {
        setMatrix((prev) => {
            const updated = [...prev];
            const row = updated[rowIndex];
            if (!row) return prev;

            updated[rowIndex] = {
                ...row,
                [cellKey]: {
                    ...row[cellKey],
                    price: value,
                },
            };
            return updated;
        });
    };

    const handleSaveMatrix = async () => {
        if (!selectedSize) {
            setError('Please select a paper size');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const colorSpec = specs.find((s) => s.slug === 'page-color' || s.slug === 'color');
            const sideSpec = specs.find((s) => s.slug === 'page-side' || s.slug === 'side');

            if (!colorSpec || !sideSpec) {
                throw new Error('Color and Side specifications are required');
            }

            // Process each cell
            for (const row of matrix) {
                const typeValue = row.paperType.value;
                const cells = [
                    { key: 'bwSingle' as const, color: 'bw', side: 'single' },
                    { key: 'bwBoth' as const, color: 'bw', side: 'both' },
                    { key: 'colorSingle' as const, color: 'color', side: 'single' },
                    { key: 'colorBoth' as const, color: 'color', side: 'both' },
                ];

                for (const cell of cells) {
                    const cellData = row[cell.key];
                    const price = parseFloat(cellData.price);

                    if (isNaN(price) || price <= 0) {
                        // Delete rule if price is empty/invalid
                        if (cellData.ruleId) {
                            try {
                                await deleteCategoryPricingRuleApi(categoryId, cellData.ruleId);
                            } catch {
                                // Ignore errors
                            }
                        }
                        continue;
                    }

                    const specificationValues = {
                        size: selectedSize,
                        type: typeValue,
                        'page-color': cell.color,
                        'page-side': cell.side,
                    };

                    if (cellData.ruleId) {
                        // Update existing rule
                        await updateCategoryPricingRuleApi(categoryId, cellData.ruleId, {
                            ruleType: 'SPECIFICATION_COMBINATION',
                            specificationValues,
                            basePrice: price,
                            quantityMultiplier: true,
                            isActive: true,
                            priority: 100,
                        });
                    } else {
                        // Create new rule
                        const created = await createCategoryPricingRuleApi(categoryId, {
                            ruleType: 'SPECIFICATION_COMBINATION',
                            specificationValues,
                            basePrice: price,
                            quantityMultiplier: true,
                            isActive: true,
                            priority: 100,
                        });
                        // Update local state
                        setMatrix((prev) =>
                            prev.map((r) => {
                                if (r.paperType.value === typeValue) {
                                    const updatedRow = { ...r };
                                    updatedRow[cell.key] = { ...updatedRow[cell.key], ruleId: created.id };
                                    return updatedRow;
                                }
                                return r;
                            })
                        );
                    }
                }
            }

            // Reload rules
            const updatedRules = await getCategoryPricingRulesApi(categoryId);
            setRules(updatedRules);

            alert('Pricing matrix saved successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save pricing matrix');
        } finally {
            setSaving(false);
        }
    };

    const sizeSpec = specs.find((s) => s.slug === 'size' || s.slug === 'paper-size');

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading pricing matrix...</p>
            </div>
        );
    }

    if (!sizeSpec || sizeSpec.options.length === 0) {
        return (
            <Alert variant="error">
                Please create a "Size" or "Paper Size" specification with options first.
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing Matrix</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                    Fill prices directly in the table. Prices are per page and will multiply by quantity.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}

                {/* Size selector */}
                <div className="space-y-2">
                    <Label htmlFor="matrix-size">Paper Size</Label>
                    <select
                        id="matrix-size"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                    >
                        {sizeSpec.options.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Matrix table */}
                {matrix.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No paper types available for the selected size. Make sure paper type options have
                        dependencies set correctly.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                                        Paper Type
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 font-semibold" colSpan={2}>
                                        B/W
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 font-semibold" colSpan={2}>
                                        Color
                                    </th>
                                </tr>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold"></th>
                                    <th className="border border-gray-300 px-2 py-1 text-xs font-medium">Single</th>
                                    <th className="border border-gray-300 px-2 py-1 text-xs font-medium">Both</th>
                                    <th className="border border-gray-300 px-2 py-1 text-xs font-medium">Single</th>
                                    <th className="border border-gray-300 px-2 py-1 text-xs font-medium">Both</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row, rowIndex) => (
                                    <tr key={row.paperType.id}>
                                        <td className="border border-gray-300 px-3 py-2 font-medium">
                                            {row.paperType.label}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full border-0 px-2 py-1 text-center text-sm focus:ring-1 focus:ring-blue-500"
                                                value={row.bwSingle.price}
                                                onChange={(e) => handleCellChange(rowIndex, 'bwSingle', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full border-0 px-2 py-1 text-center text-sm focus:ring-1 focus:ring-blue-500"
                                                value={row.bwBoth.price}
                                                onChange={(e) => handleCellChange(rowIndex, 'bwBoth', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full border-0 px-2 py-1 text-center text-sm focus:ring-1 focus:ring-blue-500"
                                                value={row.colorSingle.price}
                                                onChange={(e) => handleCellChange(rowIndex, 'colorSingle', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full border-0 px-2 py-1 text-center text-sm focus:ring-1 focus:ring-blue-500"
                                                value={row.colorBoth.price}
                                                onChange={(e) => handleCellChange(rowIndex, 'colorBoth', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleSaveMatrix} isLoading={saving}>
                        Save Matrix
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

