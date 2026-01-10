'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { ChevronDown } from 'lucide-react';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import ProductDocumentUpload from '@/app/components/products/ProductDocumentUpload';
import { getCategoryBySlug, calculateCategoryPrice, getProductsBySpecifications, type Category, type CategorySpecification } from '@/lib/api/categories';
import { addToCart } from '@/lib/api/cart';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ProductData, BreadcrumbItem } from '@/types';
import { Option } from '@/types';
import { uploadOrderFilesToS3 } from '@/lib/api/uploads';

interface DynamicServicePageProps {
    params: Promise<{ categorySlug: string }>;
}

export default function DynamicServicePage({ params }: DynamicServicePageProps) {
    const { categorySlug } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { refetch: refetchCart, isProductInCart } = useCart();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [minQuantityFromFiles, setMinQuantityFromFiles] = useState<number>(1);
    const [selectedSpecifications, setSelectedSpecifications] = useState<Record<string, any>>({});
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [matchingProduct, setMatchingProduct] = useState<any | null>(null);
    const [checkingProduct, setCheckingProduct] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

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

    // Handle file upload with quantity calculation
    // Files are stored in memory - uploaded to S3 only when adding to cart
    const handleFileSelect = async (files: File[], totalQuantity: number) => {
        setUploadedFiles(files);

        // Set minimum quantity based on files
        if (totalQuantity > 0) {
            setMinQuantityFromFiles(totalQuantity);
            // Auto-update quantity if current quantity is less than calculated
            if (quantity < totalQuantity) {
                setQuantity(totalQuantity);
            }
        } else {
            setMinQuantityFromFiles(1);
            // Reset to 1 if no files
            if (quantity < 1) {
                setQuantity(1);
            }
        }

        // Files will be uploaded to S3 when user adds to cart
    };

    // Update quantity handler - prevent decreasing below minimum
    const handleQuantityChange = (newQuantity: number) => {
        const minQty = Math.max(1, minQuantityFromFiles);
        setQuantity(Math.max(newQuantity, minQty));
    };

    // Note: uploadFile function removed - files are now stored in memory only
    // and uploaded after order confirmation via fileStorage utility

    // Check which required specifications are missing
    const getMissingRequiredSpecs = (): CategorySpecification[] => {
        if (!category) return [];

        return category.specifications.filter(spec => {
            // Only check visible and required specifications
            if (!spec.isRequired || !isSpecificationVisible(spec)) {
                return false;
            }

            // Check if specification has a value
            const value = selectedSpecifications[spec.slug];

            // For different types, check differently
            if (spec.type === 'SELECT' || spec.type === 'MULTI_SELECT' || spec.type === 'BOOLEAN') {
                return !value || value === '';
            } else if (spec.type === 'NUMBER') {
                return value === undefined || value === null || value === '';
            } else if (spec.type === 'TEXT') {
                return !value || value.trim() === '';
            }

            return !value;
        });
    };

    const handleAddToCart = async () => {
        // Check authentication
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Check if file is required and uploaded
        if (category?.configuration?.fileUploadRequired && uploadedFiles.length === 0) {
            alert('Please upload a file to continue.');
            return;
        }

        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            alert('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        // Check if product exists
        if (!matchingProduct?.id) {
            alert('Product does not exist. Please contact us.');
            return;
        }

        setAddingToCart(true);
        try {
            // Upload files to S3 if files are present
            let s3Keys: string[] = [];
            if (uploadedFiles.length > 0) {
                setUploadingFiles(true);
                try {
                    const uploadResponse = await uploadOrderFilesToS3(uploadedFiles);
                    if (uploadResponse.success && uploadResponse.data) {
                        s3Keys = uploadResponse.data.files.map(f => f.key);
                    } else {
                        alert('Failed to upload files. Please try again.');
                        setAddingToCart(false);
                        setUploadingFiles(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                    alert('Failed to upload files. Please try again.');
                    setAddingToCart(false);
                    setUploadingFiles(false);
                    return;
                } finally {
                    setUploadingFiles(false);
                }
            }

            // Add to cart with S3 URLs
            const response = await addToCart({
                productId: matchingProduct.id,
                quantity,
                customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
            });

            if (response.success) {
                // Reset uploaded files after adding to cart
                setUploadedFiles([]);
                // Refresh cart to update count
                await refetchCart();
                alert('✅ Product added to cart successfully!');
                // Optionally reload to update UI
                window.location.reload();
            } else {
                alert(response.error || 'Failed to add product to cart. Please try again.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        // Check authentication
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Check for missing required specifications
        const missingSpecs = getMissingRequiredSpecs();
        if (missingSpecs.length > 0) {
            const missingNames = missingSpecs.map(spec => spec.name).join(', ');
            alert(`Please select the following required specifications:\n\n${missingNames}`);
            return;
        }

        // Check if file is required and uploaded
        if (category?.configuration?.fileUploadRequired && uploadedFiles.length === 0) {
            alert('Please upload a file to continue.');
            return;
        }

        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            alert('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        // Check if product exists
        if (!matchingProduct?.id) {
            const missingSpecs = getMissingRequiredSpecs();
            if (missingSpecs.length > 0) {
                const missingNames = missingSpecs.map(spec => spec.name).join(', ');
                alert(`Please select the following required specifications:\n\n${missingNames}`);
            } else {
                alert('Please select all required specifications to proceed.');
            }
            return;
        }

        setBuyNowLoading(true);
        try {
            // Upload files to S3 if files are present
            let s3Keys: string[] = [];
            if (uploadedFiles.length > 0) {
                setUploadingFiles(true);
                try {
                    const uploadResponse = await uploadOrderFilesToS3(uploadedFiles);
                    if (uploadResponse.success && uploadResponse.data) {
                        s3Keys = uploadResponse.data.files.map(f => f.key);
                    } else {
                        alert('Failed to upload files. Please try again.');
                        setBuyNowLoading(false);
                        setUploadingFiles(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                    alert('Failed to upload files. Please try again.');
                    setBuyNowLoading(false);
                    setUploadingFiles(false);
                    return;
                } finally {
                    setUploadingFiles(false);
                }
            }

            // Add to cart with S3 URLs and redirect to checkout
            const response = await addToCart({
                productId: matchingProduct.id,
                quantity,
                customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
            });

            if (response.success) {
                // Reset uploaded files
                setUploadedFiles([]);
                // Redirect to checkout
                router.push('/checkout');
            } else {
                alert(response.error || 'Failed to proceed. Please try again.');
            }
        } catch (error) {
            console.error('Error in buy now:', error);
            alert('Failed to proceed. Please try again.');
        } finally {
            setBuyNowLoading(false);
        }
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
        <div className="min-h-screen bg-white">
            <ProductPageTemplate
                productData={productData}
                breadcrumbItems={breadcrumbItems}
                uploadedFile={uploadedFiles[0] || null}
                onFileSelect={(file) => {
                    if (file) {
                        handleFileSelect([file], 1);
                    } else {
                        handleFileSelect([], 0);
                    }
                }}
                onFileSelectWithQuantity={handleFileSelect}
                onQuantityChange={(calculatedQuantity) => {
                    // Only auto-update if files are uploaded
                    if (calculatedQuantity > 0) {
                        setQuantity(calculatedQuantity);
                    }
                }}
                onFileRemove={() => {
                    setUploadedFiles([]);
                    setMinQuantityFromFiles(1);
                    setQuantity(1);
                }}
                priceItems={priceBreakdown}
                totalPrice={totalPrice}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                addToCartLoading={addingToCart || uploadingFiles}
                buyNowLoading={buyNowLoading || uploadingFiles}
                isInCart={matchingProduct ? isProductInCart(matchingProduct.name) : false}
                stock={matchingProduct?.stock ?? null}
                isOutOfStock={matchingProduct ? matchingProduct.stock <= 0 : false}
                productId={matchingProduct?.id ?? null}
                images={categoryImages}
                minQuantity={minQuantityFromFiles}
            >
                {/* Dynamic Configuration Options */}
                <div className="space-y-8">
                    {visibleSpecifications.map((spec) => {
                        const availableOptions = getAvailableOptions(spec);
                        if (availableOptions.length === 0) return null;

                        // Handle different specification types
                        if (spec.type === 'SELECT' || spec.type === 'MULTI_SELECT') {
                            return (
                                <div key={spec.id} className="space-y-2">
                                    <label htmlFor={`spec-${spec.slug}`} className="block text-sm font-medium text-gray-700 font-hkgb">
                                        {spec.name}
                                        {spec.isRequired && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id={`spec-${spec.slug}`}
                                            value={selectedSpecifications[spec.slug] || ''}
                                            onChange={(e) => handleSpecificationChange(spec.slug, e.target.value)}
                                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent bg-white text-gray-900 text-sm sm:text-base appearance-none cursor-pointer"
                                            required={spec.isRequired}
                                        >
                                            <option value="" disabled>
                                                Select {spec.name}
                                            </option>
                                            {availableOptions.map((option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.value}
                                                    disabled={option.disabled}
                                                >
                                                    {option.label}
                                                    {option.description && ` - ${option.description}`}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
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
                            const isMissing = spec.isRequired && (!selectedSpecifications[spec.slug] || selectedSpecifications[spec.slug] === '');
                            return (
                                <div key={spec.id} className="space-y-2">
                                    <label htmlFor={`spec-${spec.slug}`} className={`block text-sm font-medium font-hkgb ${isMissing ? 'text-red-600' : 'text-gray-700'}`}>
                                        {spec.name}
                                        {spec.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        {isMissing && <span className="text-red-500 text-xs ml-2 font-normal">(Required - Please select)</span>}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id={`spec-${spec.slug}`}
                                            value={selectedSpecifications[spec.slug] || ''}
                                            onChange={(e) => handleSpecificationChange(spec.slug, e.target.value)}
                                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent bg-white text-gray-900 text-sm sm:text-base appearance-none cursor-pointer ${isMissing ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            required={spec.isRequired}
                                        >
                                            <option value="">Select {spec.name}</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            );
                        } else if (spec.type === 'TEXT') {
                            const isMissing = spec.isRequired && (!selectedSpecifications[spec.slug] || selectedSpecifications[spec.slug].trim() === '');
                            return (
                                <div key={spec.id} className="space-y-4">
                                    <label className={`block text-sm font-medium mb-3 font-hkgb ${isMissing ? 'text-red-600' : 'text-gray-700'}`}>
                                        {spec.name}
                                        {spec.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        {isMissing && <span className="text-red-500 text-xs ml-2 font-normal">(Required - Please enter)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedSpecifications[spec.slug] || ''}
                                        onChange={(e) => handleSpecificationChange(spec.slug, e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008ECC] focus:border-transparent ${isMissing ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder={`Enter ${spec.name.toLowerCase()}`}
                                        required={spec.isRequired}
                                    />
                                </div>
                            );
                        }

                        return null;
                    })}

                    {/* Quantity Selector (if not already included as a specification) */}
                    {!visibleSpecifications.some(spec => spec.slug === 'quantity' && spec.type === 'NUMBER') && (
                        <div className="space-y-2">
                            <QuantitySelector
                                value={quantity}
                                onChange={handleQuantityChange}
                                label="Quantity"
                                unit={uploadedFiles.length > 0 ? "pages" : ""}
                                min={minQuantityFromFiles}
                                max={1000}
                            />
                            {uploadedFiles.length > 0 && minQuantityFromFiles > 1 && (
                                <p className="text-xs text-blue-600">
                                    Minimum quantity: {minQuantityFromFiles} (based on uploaded files)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {calculatingPrice && (
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Calculating price...
                    </div>
                )}
            </ProductPageTemplate>
        </div>
    );
}

