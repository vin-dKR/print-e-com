'use client';

/**
 * Category Pricing Rules Management
 */

import { useEffect, useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert } from '@/app/components/ui/alert';
import {
    getCategoryById,
    getCategoryPricingRulesApi,
    createCategoryPricingRuleApi,
    updateCategoryPricingRuleApi,
    deleteCategoryPricingRuleApi,
    getCategorySpecificationsApi,
    previewProductFromPricingRuleApi,
    publishPricingRuleAsProductApi,
    type Category,
    type CategoryPricingRule,
    type PricingRuleType,
    type CategorySpecification,
} from '@/lib/api/categories.service';
import { PricingMatrix } from './pricing-matrix';
import { Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CategoryPricingProps {
    categoryId: string;
}

const RULE_TYPES: { value: PricingRuleType; label: string }[] = [
    { value: 'BASE_PRICE', label: 'Base Price' },
    { value: 'SPECIFICATION_COMBINATION', label: 'Specification Combination' },
    { value: 'QUANTITY_TIER', label: 'Quantity Tier' },
    { value: 'ADDON', label: 'Addon' },
];

export function CategoryPricing({ categoryId }: CategoryPricingProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [rules, setRules] = useState<CategoryPricingRule[]>([]);
    const [specs, setSpecs] = useState<CategorySpecification[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pricingMode, setPricingMode] = useState<'matrix' | 'rules'>('matrix');

    // Selected spec filters for current rule (slug -> option value)
    const [specFilters, setSpecFilters] = useState<Record<string, string>>({});

    const [form, setForm] = useState<{
        id?: string;
        ruleType: PricingRuleType;
        basePrice: string;
        priceModifier: string;
        quantityMultiplier: boolean;
        minQuantity: string;
        maxQuantity: string;
        isActive: boolean;
        priority: string;
    }>({
        ruleType: 'BASE_PRICE',
        basePrice: '',
        priceModifier: '',
        quantityMultiplier: true,
        minQuantity: '',
        maxQuantity: '',
        isActive: true,
        priority: '0',
    });

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const [cat, pricingRules, specifications] = await Promise.all([
                    getCategoryById(categoryId),
                    getCategoryPricingRulesApi(categoryId),
                    getCategorySpecificationsApi(categoryId),
                ]);
                setCategory(cat);
                setRules(pricingRules);
                setSpecs(
                    (specifications || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load pricing rules');
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [categoryId]);

    const resetForm = () => {
        setForm({
            ruleType: 'BASE_PRICE',
            basePrice: '',
            priceModifier: '',
            quantityMultiplier: true,
            minQuantity: '',
            maxQuantity: '',
            isActive: true,
            priority: '0',
        });
        setSpecFilters({});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            // Build specificationValues from selected spec filters
            const specificationValues: Record<string, any> = { ...specFilters };

            const payload = {
                ruleType: form.ruleType,
                specificationValues,
                basePrice: form.basePrice ? Number(form.basePrice) : null,
                priceModifier: form.priceModifier ? Number(form.priceModifier) : null,
                quantityMultiplier: form.quantityMultiplier,
                minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
                maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : null,
                isActive: form.isActive,
                priority: form.priority ? Number(form.priority) : 0,
            };

            if (form.id) {
                const updated = await updateCategoryPricingRuleApi(categoryId, form.id, payload);
                setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            } else {
                const created = await createCategoryPricingRuleApi(categoryId, payload);
                setRules((prev) => [...prev, created].sort((a, b) => b.priority - a.priority));
            }

            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save pricing rule');
        } finally {
            setSaving(false);
        }
    };

    const handleEditRule = (rule: CategoryPricingRule) => {
        const existingValues = (rule.specificationValues || {}) as Record<string, any>;
        const nextFilters: Record<string, string> = {};
        Object.entries(existingValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                nextFilters[key] = String(value);
            }
        });

        setForm({
            id: rule.id,
            ruleType: rule.ruleType,
            basePrice: rule.basePrice != null ? String(rule.basePrice) : '',
            priceModifier: rule.priceModifier != null ? String(rule.priceModifier) : '',
            quantityMultiplier: rule.quantityMultiplier,
            minQuantity: rule.minQuantity != null ? String(rule.minQuantity) : '',
            maxQuantity: rule.maxQuantity != null ? String(rule.maxQuantity) : '',
            isActive: rule.isActive,
            priority: String(rule.priority ?? 0),
        });
        setSpecFilters(nextFilters);
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Delete this pricing rule?')) return;
        try {
            await deleteCategoryPricingRuleApi(categoryId, ruleId);
            setRules((prev) => prev.filter((r) => r.id !== ruleId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete pricing rule');
        }
    };

    const handlePublishProduct = async (ruleId: string) => {
        if (!confirm('Publish this pricing rule as a product? You can set stock and other details after publishing.')) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            // For now, publish with default values. In a full implementation, you'd show a modal/form
            const product = await publishPricingRuleAsProductApi(categoryId, ruleId, {
                stock: 0, // Admin can update this later
            });
            // Reload rules to get updated isPublished status
            const updatedRules = await getCategoryPricingRulesApi(categoryId);
            setRules(updatedRules);
            alert(`Product "${product.name}" published successfully!`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading pricing rules...</p>
            </div>
        );
    }

    if (!category) {
        return <Alert variant="error">Category not found.</Alert>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Pricing Rules - {category.name}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Configure how prices are calculated for this category based on specifications and
                    quantity.
                </p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {/* Mode selector */}
            <div className="flex gap-2 border-b pb-4">
                <Button
                    variant={pricingMode === 'matrix' ? 'default' : 'outline'}
                    onClick={() => setPricingMode('matrix')}
                >
                    Matrix Pricing (Easy)
                </Button>
                <Button
                    variant={pricingMode === 'rules' ? 'default' : 'outline'}
                    onClick={() => setPricingMode('rules')}
                >
                    Advanced Rules
                </Button>
            </div>

            {pricingMode === 'matrix' ? (
                <PricingMatrix categoryId={categoryId} />
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Rule form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{form.id ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="rule-type">Rule Type</Label>
                                    <select
                                        id="rule-type"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        value={form.ruleType}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                ruleType: e.target.value as PricingRuleType,
                                            }))
                                        }
                                    >
                                        {RULE_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {specs.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>When these selections match (optional)</Label>
                                        <div className="space-y-2 rounded-md border border-gray-100 bg-gray-50/60 p-3">
                                            {specs.map((spec) => (
                                                <div
                                                    key={spec.id}
                                                    className="grid items-center gap-2 md:grid-cols-[1.2fr,minmax(0,1fr)]"
                                                >
                                                    <div className="text-xs font-medium text-gray-700 md:text-sm">
                                                        {spec.name}{' '}
                                                        <span className="text-[11px] font-normal text-gray-400">
                                                            ({spec.slug})
                                                        </span>
                                                    </div>
                                                    <select
                                                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                        value={specFilters[spec.slug] ?? ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setSpecFilters((prev) => {
                                                                const next = { ...prev };
                                                                if (!value) {
                                                                    delete next[spec.slug];
                                                                } else {
                                                                    next[spec.slug] = value;
                                                                }
                                                                return next;
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Any</option>
                                                        {spec.options.map((opt) => (
                                                            <option key={opt.id} value={opt.value}>
                                                                {opt.label} ({opt.value})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            Leave a field as “Any” to not restrict this rule by that specification.
                                        </p>
                                    </div>
                                )}

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="base-price">Base Price (₹)</Label>
                                        <Input
                                            id="base-price"
                                            type="number"
                                            step="0.01"
                                            value={form.basePrice}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    basePrice: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price-modifier">Price Modifier (₹)</Label>
                                        <Input
                                            id="price-modifier"
                                            type="number"
                                            step="0.01"
                                            value={form.priceModifier}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    priceModifier: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="min-qty">Min Quantity</Label>
                                        <Input
                                            id="min-qty"
                                            type="number"
                                            value={form.minQuantity}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    minQuantity: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max-qty">Max Quantity</Label>
                                        <Input
                                            id="max-qty"
                                            type="number"
                                            value={form.maxQuantity}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    maxQuantity: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Input
                                            id="priority"
                                            type="number"
                                            value={form.priority}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    priority: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="qty-multiplier"
                                                type="checkbox"
                                                checked={form.quantityMultiplier}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        quantityMultiplier: e.target.checked,
                                                    }))
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="qty-multiplier">Multiply by quantity</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="is-active"
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        isActive: e.target.checked,
                                                    }))
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="is-active">Active</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    {form.id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetForm}
                                            disabled={saving}
                                        >
                                            Cancel edit
                                        </Button>
                                    )}
                                    <Button type="submit" isLoading={saving}>
                                        {form.id ? 'Update Rule' : 'Add Rule'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Rules list */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {rules.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No pricing rules yet. Add rules to define how prices are calculated.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[520px] overflow-auto text-sm">
                                    {rules
                                        .slice()
                                        .sort((a, b) => b.priority - a.priority)
                                        .map((rule) => (
                                            <div
                                                key={rule.id}
                                                className="rounded-md border px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-gray-900">
                                                        {rule.ruleType}{' '}
                                                        {!rule.isActive && (
                                                            <span className="ml-2 text-xs text-red-500">Inactive</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditRule(rule)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Priority {rule.priority} • Qty multiplier:{' '}
                                                    {rule.quantityMultiplier ? 'Yes' : 'No'}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Base: ₹{rule.basePrice ?? '-'} • Modifier: ₹{rule.priceModifier ?? '-'} •
                                                    Qty: {rule.minQuantity ?? '-'} - {rule.maxQuantity ?? '-'}
                                                </div>
                                                <div className="mt-2 rounded bg-gray-50 p-2">
                                                    <div className="text-xs font-medium text-gray-700 mb-1">Specifications:</div>
                                                    <div className="space-y-1">
                                                        {Object.keys(rule.specificationValues || {}).length === 0 ? (
                                                            <span className="text-xs text-gray-400">No specific restrictions</span>
                                                        ) : (
                                                            Object.entries(rule.specificationValues || {}).map(([specSlug, value]) => {
                                                                const spec = specs.find((s) => s.slug === specSlug);
                                                                const option = spec?.options.find((o) => o.value === value);
                                                                return (
                                                                    <div key={specSlug} className="text-xs text-gray-600">
                                                                        <span className="font-medium">{spec?.name || specSlug}:</span>{' '}
                                                                        <span>{option?.label || String(value)}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                                {rule.isPublished && (
                                                    <div className="mt-2 flex items-center gap-2 rounded bg-green-50 px-2 py-1">
                                                        <Package className="h-3 w-3 text-green-600" />
                                                        <span className="text-xs font-medium text-green-700">Published as Product</span>
                                                        {rule.productId && (
                                                            <Link
                                                                href={`/products/${rule.productId}`}
                                                                className="ml-auto text-xs text-green-600 hover:underline flex items-center gap-1"
                                                            >
                                                                View Product
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                                {!rule.isPublished && rule.basePrice && (
                                                    <div className="mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handlePublishProduct(rule.id)}
                                                            className="w-full"
                                                        >
                                                            <Package className="mr-1 h-3 w-3" />
                                                            Publish as Product
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
