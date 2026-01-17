'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { ChevronDown } from 'lucide-react';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import { PageCountDisplay } from '@/app/components/services/PageCountDisplay';
import { CopiesSelector } from '@/app/components/services/CopiesSelector';
import { QuantityWithCopiesSelector } from '@/app/components/services/QuantityWithCopiesSelector';
import { FileDetail } from '@/app/components/products/ProductDocumentUpload';
import { getCategoryBySlug, calculateCategoryPrice, getProductsBySpecifications, type Category, type CategorySpecification } from '@/lib/api/categories';
import { addToCart } from '@/lib/api/cart';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ProductData, BreadcrumbItem } from '@/types';
import { Option } from '@/types';
import { uploadOrderFilesToS3 } from '@/lib/api/uploads';
import { toastWarning, toastError, toastSuccess, toastPromise } from '@/lib/utils/toast';
import { redirectToLoginWithReturn } from '@/lib/utils/auth-redirect';

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
    const [uploadedFileDetails, setUploadedFileDetails] = useState<FileDetail[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [minQuantityFromFiles, setMinQuantityFromFiles] = useState<number>(1);

    // Check if files are currently uploading
    const isUploadingFiles = useMemo(() => {
        return uploadedFileDetails.some(fd => fd.uploadStatus === 'uploading');
    }, [uploadedFileDetails]);
    const [selectedSpecifications, setSelectedSpecifications] = useState<Record<string, any>>({});
    const [pageCount, setPageCount] = useState(0); // Fixed, calculated from files
    const [copies, setCopies] = useState(1); // Editable, default 1
    const [quantity, setQuantity] = useState<number>(1); // Keep for backward compatibility with NUMBER spec type
    const [isCopiesMode, setIsCopiesMode] = useState(false); // Track if user is in copies mode

    // Calculate total quantity
    const totalQuantity = useMemo(() => {
        if (pageCount > 0) {
            // When files are uploaded, use pageCount × copies
            return pageCount * copies;
        } else {
            // When no files, use quantity × copies if in copies mode, otherwise use quantity
            return isCopiesMode ? quantity * copies : quantity;
        }
    }, [pageCount, copies, quantity, isCopiesMode]);

    // Calculate PDF and image counts for breakdown
    const { pdfPageCount, imageCount } = useMemo(() => {
        let pdfPages = 0;
        let images = 0;

        uploadedFileDetails.forEach(detail => {
            if (detail.type === 'pdf') {
                pdfPages += detail.pageCount;
            } else if (detail.type === 'image') {
                images += 1; // Each image = 1 page
            }
        });

        return { pdfPageCount: pdfPages, imageCount: images };
    }, [uploadedFileDetails]);

    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [basePricePerUnit, setBasePricePerUnit] = useState<number>(0);
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

    const calculatePrice = useCallback(async () => {
        if (!category) return;

        try {
            setCalculatingPrice(true);
            // Always use totalQuantity which already includes copies multiplication
            const result = await calculateCategoryPrice(categorySlug, {
                specifications: selectedSpecifications,
                quantity: totalQuantity,
            });
            setPriceBreakdown(result.breakdown);
            setTotalPrice(result.totalPrice);
            // Calculate base price per unit from total price and quantity
            if (totalQuantity > 0) {
                setBasePricePerUnit(result.totalPrice / totalQuantity);
            } else {
                setBasePricePerUnit(0);
            }
        } catch (err: any) {
            // Only log network errors, don't show toasts or redirect
            if (err?.message?.includes('NetworkError') || err?.name === 'TypeError') {
                console.warn('Price calculation network error (will retry):', err);
            } else {
                console.error('Price calculation error:', err);
            }
            // Don't clear price on network errors - keep previous values
            if (!err?.message?.includes('NetworkError') && err?.name !== 'TypeError') {
                setPriceBreakdown([]);
                setTotalPrice(0);
            }
        } finally {
            setCalculatingPrice(false);
        }
    }, [category, categorySlug, selectedSpecifications, totalQuantity]);

    const checkForProduct = useCallback(async () => {
        if (!category) return;

        try {
            setCheckingProduct(true);
            const products = await getProductsBySpecifications(categorySlug, selectedSpecifications);
            // Find the first matching product (should be only one if published correctly)
            setMatchingProduct(products.length > 0 ? products[0] : null);
        } catch (err: any) {
            // Only log network errors, don't show toasts or redirect
            if (err?.message?.includes('NetworkError') || err?.name === 'TypeError') {
                console.warn('Product check network error (will retry):', err);
            } else {
                console.error('Product check error:', err);
            }
            // Don't clear product on network errors - keep previous value
            if (!err?.message?.includes('NetworkError') && err?.name !== 'TypeError') {
                setMatchingProduct(null);
            }
        } finally {
            setCheckingProduct(false);
        }
    }, [category, categorySlug, selectedSpecifications]);

    // Calculate price and check for products whenever selections or quantity change
    useEffect(() => {
        if (category && Object.keys(selectedSpecifications).length > 0) {
            calculatePrice();
            checkForProduct();
        } else {
            setMatchingProduct(null);
        }
    }, [selectedSpecifications, totalQuantity, category, categorySlug, calculatePrice, checkForProduct]);

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

    // Handle file upload with page count calculation
    // Files are stored in memory - uploaded to S3 only when adding to cart
    const handleFileSelect = async (files: File[], calculatedPageCount: number, fileDetails?: FileDetail[]) => {
        setUploadedFiles(files);
        if (fileDetails) {
            setUploadedFileDetails(fileDetails);
        }

        // Set page count (fixed, based on files)
        if (calculatedPageCount > 0) {
            setPageCount(calculatedPageCount);
            setMinQuantityFromFiles(calculatedPageCount);
        } else {
            setPageCount(0);
            setMinQuantityFromFiles(1);
        }

        // Reset copies to 1 when files change
        setCopies(1);

        // Files will be uploaded to S3 when user adds to cart
    };

    // Helper function to get file type for display
    const getFileType = (fileDetails: FileDetail[]): 'pdf' | 'image' | 'mixed' => {
        if (fileDetails.length === 0) return 'pdf';
        const hasPDF = fileDetails.some(fd => fd.type === 'pdf');
        const hasImage = fileDetails.some(fd => fd.type === 'image');

        if (hasPDF && hasImage) return 'mixed';
        if (hasPDF) return 'pdf';
        if (hasImage) return 'image';
        return 'pdf'; // default
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

    // Check if all required fields are filled (for button disabling)
    const areAllRequiredFieldsFilled = useMemo(() => {
        if (!category) return false;

        // Check required specifications
        const requiredSpecs = category.specifications.filter(spec => {
            if (!spec.isRequired || !isSpecificationVisible(spec)) {
                return false;
            }
            const value = selectedSpecifications[spec.slug];
            if (spec.type === 'SELECT' || spec.type === 'MULTI_SELECT' || spec.type === 'BOOLEAN') {
                return !value || value === '';
            } else if (spec.type === 'NUMBER') {
                return value === undefined || value === null || value === '';
            } else if (spec.type === 'TEXT') {
                return !value || value.trim() === '';
            }
            return !value;
        });

        if (requiredSpecs.length > 0) return false;

        // Check if file upload is required
        if (category.configuration?.fileUploadRequired && uploadedFiles.length === 0) {
            return false;
        }

        // Check if product exists (matching product found)
        if (!matchingProduct?.id) {
            return false;
        }

        // Check if out of stock
        if (matchingProduct.stock <= 0) {
            return false;
        }

        return true;
    }, [category, selectedSpecifications, uploadedFiles, matchingProduct]);

    const handleAddToCart = async () => {
        // Check authentication
        if (!isAuthenticated) {
            redirectToLoginWithReturn();
            return;
        }

        // Check if file is required and uploaded
        if (category?.configuration?.fileUploadRequired && uploadedFiles.length === 0) {
            toastWarning('Please upload a file to continue.');
            return;
        }

        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            toastWarning('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        // Check if product exists
        if (!matchingProduct?.id) {
            toastWarning('Product does not exist. Please contact us.');
            return;
        }

        setAddingToCart(true);
        try {
            // Upload files to S3 if files are present
            let s3Keys: string[] = [];
            if (uploadedFiles.length > 0) {
                setUploadingFiles(true);
                try {
                    const uploadResponse = await toastPromise(
                        uploadOrderFilesToS3(uploadedFiles),
                        {
                            loading: 'Uploading files...',
                            success: 'Files uploaded successfully!',
                            error: 'Failed to upload files. Please try again.',
                        }
                    );
                    if (uploadResponse.success && uploadResponse.data) {
                        s3Keys = uploadResponse.data.files.map(f => f.key);
                    } else {
                        toastError('Failed to upload files. Please try again.');
                        setAddingToCart(false);
                        setUploadingFiles(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                    toastError('Failed to upload files. Please try again.');
                    setAddingToCart(false);
                    setUploadingFiles(false);
                    return;
                } finally {
                    setUploadingFiles(false);
                }
            }

            // Add to cart with S3 URLs
            // Always use totalQuantity which already includes copies multiplication
            const response = await toastPromise(
                addToCart({
                    productId: matchingProduct.id,
                    quantity: totalQuantity,
                    customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
                }),
                {
                    loading: 'Adding to cart...',
                    success: 'Product added to cart successfully!',
                    error: 'Failed to add product to cart. Please try again.',
                }
            );

            if (response.success) {
                // Reset uploaded files after adding to cart
                setUploadedFiles([]);
                // Refresh cart to update count
                await refetchCart();
                // Optionally reload to update UI
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toastError(response.error || 'Failed to add product to cart. Please try again.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toastError('Failed to add product to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        // Check authentication
        if (!isAuthenticated) {
            redirectToLoginWithReturn();
            return;
        }

        // Check for missing required specifications
        const missingSpecs = getMissingRequiredSpecs();
        if (missingSpecs.length > 0) {
            const missingNames = missingSpecs.map(spec => spec.name).join(', ');
            toastWarning(`Please select the following required specifications: ${missingNames}`);
            return;
        }

        // Check if file is required and uploaded
        if (category?.configuration?.fileUploadRequired && uploadedFiles.length === 0) {
            toastWarning('Please upload a file to continue.');
            return;
        }

        // Check if product is out of stock
        if (matchingProduct && matchingProduct.stock <= 0) {
            toastWarning('This product is out of stock. Please select a different combination or contact us.');
            return;
        }

        // Check if product exists
        if (!matchingProduct?.id) {
            const missingSpecs = getMissingRequiredSpecs();
            if (missingSpecs.length > 0) {
                const missingNames = missingSpecs.map(spec => spec.name).join(', ');
                toastWarning(`Please select the following required specifications: ${missingNames}`);
            } else {
                toastWarning('Please select all required specifications to proceed.');
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
                    const uploadResponse = await toastPromise(
                        uploadOrderFilesToS3(uploadedFiles),
                        {
                            loading: 'Uploading files...',
                            success: 'Files uploaded successfully!',
                            error: 'Failed to upload files. Please try again.',
                        }
                    );
                    if (uploadResponse.success && uploadResponse.data) {
                        s3Keys = uploadResponse.data.files.map(f => f.key);
                    } else {
                        toastError('Failed to upload files. Please try again.');
                        setBuyNowLoading(false);
                        setUploadingFiles(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                    toastError('Failed to upload files. Please try again.');
                    setBuyNowLoading(false);
                    setUploadingFiles(false);
                    return;
                } finally {
                    setUploadingFiles(false);
                }
            }

            // Store product data in sessionStorage for direct checkout (bypass cart)
            const buyNowData = {
                productId: matchingProduct.id,
                quantity: totalQuantity,
                customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
                product: matchingProduct,
                price: totalPrice,
                priceBreakdown,
            };

            sessionStorage.setItem('buyNow', JSON.stringify(buyNowData));

            // Reset uploaded files
            setUploadedFiles([]);

            // Redirect to checkout immediately
            toastSuccess('Redirecting to checkout...');
            router.push('/checkout');
        } catch (error) {
            console.error('Error in buy now:', error);
            toastError('Failed to proceed. Please try again.');
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
                    // Legacy callback for single file - convert to new format
                    if (file) {
                        handleFileSelect([file], 1, undefined);
                    } else {
                        handleFileSelect([], 0, undefined);
                    }
                }}
                onFileSelectWithQuantity={handleFileSelect}
                onFileRemove={() => {
                    setUploadedFiles([]);
                    setUploadedFileDetails([]);
                    setPageCount(0);
                    setMinQuantityFromFiles(1);
                    setCopies(1);
                }}
                priceItems={priceBreakdown}
                totalPrice={totalPrice}
                basePricePerUnit={basePricePerUnit}
                pageCount={pageCount > 0 ? pageCount : undefined}
                copies={pageCount > 0 ? copies : (isCopiesMode ? copies : undefined)}
                quantity={pageCount > 0 ? totalQuantity : quantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                addToCartLoading={addingToCart}
                buyNowLoading={buyNowLoading}
                isInCart={matchingProduct ? isProductInCart(matchingProduct.name) : false}
                stock={matchingProduct?.stock ?? null}
                isOutOfStock={matchingProduct ? matchingProduct.stock <= 0 : false}
                productId={matchingProduct?.id ?? null}
                images={categoryImages}
                minQuantity={minQuantityFromFiles}
                areRequiredFieldsFilled={areAllRequiredFieldsFilled}
                hasUploadedFiles={uploadedFiles.length > 0}
                calculatingPrice={calculatingPrice}
                isUploadingFiles={isUploadingFiles}
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

                    {/* Page Count & Copies (if files are uploaded) */}
                    {pageCount > 0 && (
                        <>
                            <PageCountDisplay
                                pageCount={pageCount}
                                fileType={getFileType(uploadedFileDetails)}
                                pdfPageCount={pdfPageCount}
                                imageCount={imageCount}
                            />

                            <CopiesSelector
                                value={copies}
                                onChange={setCopies}
                                min={1}
                                max={999}
                            />

                            {/* Total Quantity Display */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    <span className="font-semibold">Total Quantity:</span> {totalQuantity} pages
                                    <br />
                                    <span className="text-xs text-blue-700">
                                        ({pageCount} pages × {copies} {copies === 1 ? 'copy' : 'copies'})
                                    </span>
                                </p>
                            </div>
                        </>
                    )}

                    {/* Quantity/Copies Selector (if not already included as a specification and no files uploaded) - Only show if files were never uploaded */}
                    {!visibleSpecifications.some(spec => spec.slug === 'quantity' && spec.type === 'NUMBER') && pageCount === 0 && uploadedFiles.length === 0 && (
                        <div className="space-y-2">
                            <QuantityWithCopiesSelector
                                quantity={quantity}
                                copies={copies}
                                onQuantityChange={setQuantity}
                                onCopiesChange={setCopies}
                                onModeChange={setIsCopiesMode}
                                min={1}
                                max={1000}
                                label="Quantity"
                            />
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

