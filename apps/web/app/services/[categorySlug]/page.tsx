'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { OptionSelector } from '@/app/components/services/print/OptionSelector';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import { getCategoryBySlug, calculateCategoryPrice, getProductsBySpecifications, type Category, type CategorySpecification } from '@/lib/api/categories';
import { ProductData, BreadcrumbItem } from '@/types';
import { Option } from '@/types';

interface DynamicServicePageProps {
    params: Promise<{ categorySlug: string }>;
}

export default function DynamicServicePage({ params }: DynamicServicePageProps) {
    const { categorySlug } = use(params);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedSpecifications, setSelectedSpecifications] = useState<Record<string, any>>({});
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [matchingProduct, setMatchingProduct] = useState<any | null>(null);
    const [checkingProduct, setCheckingProduct] = useState(false);

    // Fetch category data on mount
    useEffect(() => {
        async function fetchCategory() {
            try {
                setLoading(true);
                setError(null);
                const data = await getCategoryBySlug(categorySlug);
                setCategory(data);

                // Initialize default selections for required specifications
                const defaults: Record<string, any> = {};
                data.specifications
                    .filter(spec => spec.isRequired && spec.type === 'SELECT' && spec.options.length > 0)
                    .forEach(spec => {
                        defaults[spec.slug] = spec.options[0]?.value || '';
                    });
                setSelectedSpecifications(defaults);
            } catch (err: any) {
                setError(err.message || 'Failed to load category');
            } finally {
                setLoading(false);
            }
        }

        fetchCategory();
    }, [categorySlug]);

    // Calculate price and check for products whenever selections or quantity change
    useEffect(() => {
        if (category && Object.keys(selectedSpecifications).length > 0) {
            calculatePrice();
            checkForProduct();
        } else {
            setMatchingProduct(null);
        }
    }, [selectedSpecifications, quantity, category, categorySlug]);

    const calculatePrice = async () => {
        if (!category) return;

        try {
            setCalculatingPrice(true);
            const result = await calculateCategoryPrice(categorySlug, {
                specifications: selectedSpecifications,
                quantity,
            });
            setPriceBreakdown(result.breakdown);
            setTotalPrice(result.totalPrice);
        } catch (err: any) {
            console.error('Price calculation error:', err);
            setPriceBreakdown([]);
            setTotalPrice(0);
        } finally {
            setCalculatingPrice(false);
        }
    };

    const checkForProduct = async () => {
        if (!category) return;

        try {
            setCheckingProduct(true);
            const products = await getProductsBySpecifications(categorySlug, selectedSpecifications);
            // Find the first matching product (should be only one if published correctly)
            setMatchingProduct(products.length > 0 ? products[0] : null);
        } catch (err: any) {
            console.error('Product check error:', err);
            setMatchingProduct(null);
        } finally {
            setCheckingProduct(false);
        }
    };

    // Get available options for a specification based on dependencies
    const getAvailableOptions = (spec: CategorySpecification): Option[] => {
        // Check if this specification has dependencies
        if (spec.dependsOn) {
            const dependsOn = spec.dependsOn as Record<string, any>;
            // Check if all dependency conditions are met
            for (const [key, value] of Object.entries(dependsOn)) {
                if (selectedSpecifications[key] !== value) {
                    return []; // Hide this specification if dependencies not met
                }
            }
        }

        // Filter options based on metadata dependencies (e.g., paper type depends on selected size)
        return spec.options
            .filter((option) => {
                const metadata = option.metadata as { allowedParentValues?: string[] } | null;
                if (!metadata?.allowedParentValues || metadata.allowedParentValues.length === 0) {
                    return true; // No restriction, applies to all
                }

                // Check if any parent value matches current selections
                // For now, check against 'size' or 'paper-size' spec
                const sizeValue = selectedSpecifications['size'] || selectedSpecifications['paper-size'];
                if (!sizeValue) return true; // If no size selected yet, show all

                return metadata.allowedParentValues.includes(sizeValue);
            })
            .map((option) => ({
                id: option.id,
                label: option.label,
                value: option.value,
                description: option.metadata?.description,
                disabled: !option.isActive,
            }));
    };

    // Check if a specification should be visible based on dependencies
    const isSpecificationVisible = (spec: CategorySpecification): boolean => {
        if (!spec.dependsOn) return true;

        const dependsOn = spec.dependsOn as Record<string, any>;
        for (const [key, value] of Object.entries(dependsOn)) {
            if (selectedSpecifications[key] !== value) {
                return false;
            }
        }
        return true;
    };

    // Handle specification selection change
    const handleSpecificationChange = (specSlug: string, value: string) => {
        setSelectedSpecifications(prev => {
            const updated = { ...prev, [specSlug]: value };

            // Clear dependent specifications when parent changes
            if (category) {
                category.specifications.forEach(spec => {
                    if (spec.dependsOn) {
                        const dependsOn = spec.dependsOn as Record<string, any>;
                        if (dependsOn[specSlug] && dependsOn[specSlug] !== value) {
                            delete updated[spec.slug];
                        }
                    }
                });
            }

            return updated;
        });
    };

    // Get specification layout based on type
    const getSpecificationLayout = (spec: CategorySpecification): 'grid' | 'inline' | 'list' => {
        if (spec.type === 'BOOLEAN') return 'inline';
        if (spec.options.length <= 4) return 'inline';
        if (spec.options.length <= 6) return 'grid';
        return 'list';
    };

    // Get number of columns for grid layout
    const getGridColumns = (spec: CategorySpecification): number => {
        const optionCount = spec.options.length;
        if (optionCount <= 2) return 2;
        if (optionCount <= 4) return 4;
        if (optionCount <= 6) return 3;
        return 2;
    };

    // Prepare product data for ProductPageTemplate
    const productData: Partial<ProductData> = useMemo(() => {
        if (!category) return {};

        const config = category.configuration;
        return {
            category: categorySlug as any,
            title: config?.pageTitle || category.name,
            description: config?.pageDescription || category.description || '',
            basePrice: totalPrice || 0,
            features: config?.features || [],
        };
    }, [category, categorySlug, totalPrice]);

    // Prepare category images for ProductGallery
    const categoryImages = useMemo(() => {
        if (!category?.images || category.images.length === 0) {
            // Fallback to legacy image field if no images array
            if (category?.image) {
                return [{
                    id: 'legacy-image',
                    src: category.image,
                    alt: category.name || 'Category image',
                }];
            }
            return [];
        }

        return category.images.map((img) => ({
            id: img.id,
            src: img.url,
            alt: img.alt || category.name || 'Category image',
            thumbnailSrc: img.url, // Use same URL for thumbnail
        }));
    }, [category]);

    // Prepare breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
        if (!category?.configuration?.breadcrumbConfig) {
            return [
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: category?.name || 'Service', href: `/services/${categorySlug}`, isActive: true },
            ];
        }

        const config = category.configuration.breadcrumbConfig as any;
        if (Array.isArray(config)) {
            return config.map((item: any, index: number) => ({
                label: item.label,
                href: item.href,
                isActive: index === config.length - 1,
            }));
        }

        return [
            { label: 'Home', href: '/' },
            { label: category.name, href: `/services/${categorySlug}`, isActive: true },
        ];
    }, [category, categorySlug]);

    const handleAddToCart = () => {
        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            alert('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        const orderData = {
            categorySlug,
            specifications: selectedSpecifications,
            quantity,
            totalPrice,
            uploadedFile: uploadedFile?.name,
            productId: matchingProduct?.id,
        };

        console.log('Adding to cart:', orderData);
        // TODO: Implement add to cart logic
    };

    const handleBuyNow = () => {
        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            alert('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        const orderData = {
            categorySlug,
            specifications: selectedSpecifications,
            quantity,
            totalPrice,
            uploadedFile: uploadedFile?.name,
            productId: matchingProduct?.id,
        };

        console.log('Buying now:', orderData);
        // TODO: Implement buy now logic
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008ECC] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading service...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
                    <p className="text-gray-600">{error || 'The requested service could not be found.'}</p>
                </div>
            </div>
        );
    }

    // Filter specifications by display order and visibility
    const visibleSpecifications = category.specifications
        .filter(isSpecificationVisible)
        .sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <ProductPageTemplate
            productData={productData}
            breadcrumbItems={breadcrumbItems}
            uploadedFile={uploadedFile}
            onFileSelect={setUploadedFile}
            onFileRemove={() => setUploadedFile(null)}
            priceItems={priceBreakdown}
            totalPrice={totalPrice}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            stock={matchingProduct?.stock ?? null}
            isOutOfStock={matchingProduct ? matchingProduct.stock <= 0 : false}
            productId={matchingProduct?.id ?? null}
            images={categoryImages}
        >
            {/* Dynamic Configuration Options */}
            <div className="space-y-8">
                {visibleSpecifications.map((spec) => {
                    const availableOptions = getAvailableOptions(spec);
                    if (availableOptions.length === 0) return null;

                    // Handle different specification types
                    if (spec.type === 'SELECT' || spec.type === 'MULTI_SELECT') {
                        return (
                            <OptionSelector
                                key={spec.id}
                                title={spec.name}
                                options={availableOptions}
                                selectedValue={selectedSpecifications[spec.slug]}
                                onSelect={(value) => handleSpecificationChange(spec.slug, value)}
                                layout={getSpecificationLayout(spec)}
                                columns={getGridColumns(spec)}
                                showPrice={false}
                            />
                        );
                    } else if (spec.type === 'NUMBER') {
                        // For NUMBER type, we can use QuantitySelector or a custom input
                        if (spec.slug === 'quantity') {
                            return (
                                <QuantitySelector
                                    key={spec.id}
                                    value={quantity}
                                    onChange={(value) => {
                                        setQuantity(value);
                                        handleSpecificationChange(spec.slug, value.toString());
                                    }}
                                    label={spec.name}
                                    unit=""
                                    min={1}
                                    max={1000}
                                />
                            );
                        }
                    } else if (spec.type === 'BOOLEAN') {
                        return (
                            <div key={spec.id} className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                                    {spec.name}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleSpecificationChange(spec.slug, selectedSpecifications[spec.slug] ? '' : 'true')}
                                    className={`px-6 py-3 rounded-lg border font-medium transition-all duration-200 ${selectedSpecifications[spec.slug]
                                        ? 'border-[#008ECC] bg-[#008ECC] text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {selectedSpecifications[spec.slug] ? 'Yes' : 'No'}
                                </button>
                            </div>
                        );
                    } else if (spec.type === 'TEXT') {
                        return (
                            <div key={spec.id} className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                                    {spec.name}
                                </label>
                                <input
                                    type="text"
                                    value={selectedSpecifications[spec.slug] || ''}
                                    onChange={(e) => handleSpecificationChange(spec.slug, e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent"
                                    placeholder={`Enter ${spec.name.toLowerCase()}`}
                                />
                            </div>
                        );
                    }

                    return null;
                })}

                {/* Quantity Selector (if not already included as a specification) */}
                {!visibleSpecifications.some(spec => spec.slug === 'quantity' && spec.type === 'NUMBER') && (
                    <QuantitySelector
                        value={quantity}
                        onChange={setQuantity}
                        label="Quantity"
                        unit=""
                        min={1}
                        max={1000}
                    />
                )}
            </div>

            {calculatingPrice && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Calculating price...
                </div>
            )}
        </ProductPageTemplate>
    );
}

