"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import ProductRating from "../../components/ProductRating";
import PriceDisplay from "../../components/PriceDisplay";
import ProductDocumentUpload, { FileDetail } from "../../components/products/ProductDocumentUpload";
import ProductWishlistButton from "../../components/products/ProductWishlistButton";
import ProductShareButton from "../../components/products/ProductShareButton";
import ProductActions from "../../components/products/ProductActions";
import SizeSelector from "../../components/SizeSelector";
import QuantitySelector from "../../components/QuantitySelector";
import { PageCountDisplay } from "../../components/services/PageCountDisplay";
import { CopiesSelector } from "../../components/services/CopiesSelector";
import ProductTabs from "../../components/ProductTabs";
import RelatedProducts from "../../components/RelatedProducts";
import { BarsSpinner } from "../../components/shared/BarsSpinner";
import { useProduct } from "@/hooks/products/useProduct";
import { useCart } from "@/contexts/CartContext";
import { Star } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import ReviewList from "../../components/reviews/ReviewList";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Use the product hook for all data management
    const {
        product,
        relatedProducts,
        loading,
        error,
        isWishlisted,
        wishlistLoading,
        cartLoading,
        buyNowLoading,
        toggleWishlist,
        handleAddToCart,
        handleBuyNow,
        shareProduct,
        copyShareLink,
        currentPrice,
        originalPrice,
        discount,
        breadcrumbs,
        productImages,
        sizes,
    } = useProduct({ productId: id });

    // Check if product is already in cart
    const { isProductInCart, refetch: refetchCart } = useCart();
    const isInCart = product ? isProductInCart(product.name) : false;

    // Local UI state
    const [selectedSize, setSelectedSize] = useState<string | undefined>("");
    const [selectedVariant, setSelectedVariant] = useState<string | undefined>("");
    const [pageCount, setPageCount] = useState(0); // Fixed, calculated from files
    const [copies, setCopies] = useState(1); // Editable, default 1
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedFileDetails, setUploadedFileDetails] = useState<FileDetail[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [minQuantityFromFiles, setMinQuantityFromFiles] = useState<number>(1);

    // Calculate total quantity
    const totalQuantity = useMemo(() => {
        return pageCount * copies;
    }, [pageCount, copies]);

    // Set default variant when product loads
    useMemo(() => {
        if (product?.variants && product.variants.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]?.id);
            setSelectedSize(product.variants[0]?.name);
        }
    }, [product, selectedVariant]);

    // Handle file upload with page count calculation
    // Files are uploaded to S3 immediately when selected
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

    // Handle add to cart - use already uploaded S3 keys
    const onAddToCart = async () => {
        if (!product) return;

        // Get S3 keys from already uploaded files (files are uploaded immediately when selected)
        let s3Keys: string[] = [];
        if (uploadedFileDetails.length > 0) {
            // Wait for any files that are still uploading
            const stillUploading = uploadedFileDetails.some(fd => fd.uploadStatus === 'uploading');
            if (stillUploading) {
                toastError('Please wait for all files to finish uploading');
                return;
            }

            // If some files failed to upload, show error
            const failedUploads = uploadedFileDetails.filter(fd => fd.uploadStatus === 'error');
            if (failedUploads.length > 0) {
                toastError('Some files failed to upload. Please remove them and try again.');
                return;
            }

            // Extract S3 keys from uploaded files
            s3Keys = uploadedFileDetails
                .filter(fd => fd.uploadStatus === 'uploaded' && fd.s3Key)
                .map(fd => fd.s3Key!)
                .filter(Boolean);

            // If we have files but no S3 keys, check if they're pending
            if (s3Keys.length === 0 && uploadedFileDetails.length > 0) {
                const pendingFiles = uploadedFileDetails.filter(fd => fd.uploadStatus === 'pending');
                if (pendingFiles.length > 0) {
                    toastError('Files are still being processed. Please wait a moment and try again.');
                    return;
                }
                // If no pending files but no keys, something went wrong
                toastError('Files are still being processed. Please wait a moment and try again.');
                return;
            }
        }

        // Add to cart with S3 URLs (handleAddToCart manages cartLoading state)
        // Use totalQuantity (pageCount × copies) for cart
        const success = await handleAddToCart({
            variantId: selectedVariant,
            quantity: totalQuantity,
            customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
        });

        if (success) {
            // Reset uploaded files after adding to cart
            setUploadedFiles([]);
            toastSuccess("Product added to cart successfully!");
            // Update cart context instead of reloading page
            await refetchCart();
        } else {
            toastError("Failed to add product to cart. Please try again.");
        }
    };

    // Handle buy now - use already uploaded S3 keys
    const onBuyNow = async () => {
        if (!product) return;

        // Get S3 keys from already uploaded files (files are uploaded immediately when selected)
        let s3Keys: string[] = [];
        if (uploadedFileDetails.length > 0) {
            // Wait for any files that are still uploading
            const stillUploading = uploadedFileDetails.some(fd => fd.uploadStatus === 'uploading');
            if (stillUploading) {
                toastError('Please wait for all files to finish uploading');
                return;
            }

            // If some files failed to upload, show error
            const failedUploads = uploadedFileDetails.filter(fd => fd.uploadStatus === 'error');
            if (failedUploads.length > 0) {
                toastError('Some files failed to upload. Please remove them and try again.');
                return;
            }

            // Extract S3 keys from uploaded files
            s3Keys = uploadedFileDetails
                .filter(fd => fd.uploadStatus === 'uploaded' && fd.s3Key)
                .map(fd => fd.s3Key!)
                .filter(Boolean);

            // If we have files but no S3 keys, check if they're pending
            if (s3Keys.length === 0 && uploadedFileDetails.length > 0) {
                const pendingFiles = uploadedFileDetails.filter(fd => fd.uploadStatus === 'pending');
                if (pendingFiles.length > 0) {
                    toastError('Files are still being processed. Please wait a moment and try again.');
                    return;
                }
                // If no pending files but no keys, something went wrong
                toastError('Files are still being processed. Please wait a moment and try again.');
                return;
            }
        }

        // Add to cart with S3 URLs and redirect to checkout
        // Use totalQuantity (pageCount × copies) for buy now
        const success = await handleBuyNow({
            variantId: selectedVariant,
            quantity: totalQuantity,
            customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
        });

        if (success) {
            // Reset uploaded files after buy now
            setUploadedFiles([]);
            setUploadedFileDetails([]);
        } else {
            toastError("Failed to proceed. Please try again.");
        }
        // If success, user will be redirected to checkout
    };

    // Handle size/variant change
    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
        const variant = product?.variants?.find((v) => v.name === size);
        if (variant) {
            setSelectedVariant(variant.id);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white py-8">
                <div className="w-full mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-20">
                        <BarsSpinner />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white py-8">
                <div className="w-full mx-auto px-4 sm:px-6">
                    <div className="text-center py-12">
                        <div className="text-red-600 text-lg mb-4">⚠️ {error || "Product Not Found"}</div>
                        <p className="text-gray-600 mb-4">
                            {error === "Product not found"
                                ? "The product you're looking for doesn't exist or has been removed."
                                : "There was an error loading this product."}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => router.push("/products")}
                                className="px-6 py-2 bg-[#008ECC] text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                Browse Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare tabs content
    const tabs = [
        {
            id: "details",
            label: "Product Details",
            content: (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                            {product.description || product.shortDescription || "No description available."}
                        </p>
                    </div>

                    {/* Specifications */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.specifications.map((spec) => (
                                    <div key={spec.id} className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">{spec.key}:</span>
                                        <span className="text-gray-900">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attributes & Tags */}
                    {(product.attributes && product.attributes.length > 0) ||
                        (product.tags && product.tags.length > 0) ? (
                        <div className="space-y-4">
                            {product.attributes && product.attributes.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Attributes
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.attributes.map((attr) => (
                                            <span
                                                key={attr.id}
                                                className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700"
                                            >
                                                {attr.attributeType}: {attr.attributeValue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                                            >
                                                {tag.tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Additional Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                        {product.sku && <p>SKU: {product.sku}</p>}
                        {product.weight && <p>Weight: {product.weight} kg</p>}
                        {product.dimensions && <p>Dimensions: {product.dimensions}</p>}
                        {product.returnPolicy && (
                            <div>
                                <p className="font-medium text-gray-900 mt-4">Return Policy:</p>
                                <p>{product.returnPolicy}</p>
                            </div>
                        )}
                        {product.warranty && (
                            <div>
                                <p className="font-medium text-gray-900 mt-4">Warranty:</p>
                                <p>{product.warranty}</p>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: "reviews",
            label: "Rating & Reviews",
            content: (
                <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl">
                    <ReviewList
                        productId={id}
                        productRating={product.rating ? Number(product.rating) : 0}
                        productTotalReviews={product.totalReviews || 0}
                    />
                </div>
            ),
        },
        {
            id: "faqs",
            label: "FAQs",
            content: (
                <div className="space-y-4">
                    <div className="text-center py-12 text-gray-500">
                        <p>No FAQs available for this product yet.</p>
                    </div>
                </div>
            ),
        },
    ];

    // Prepare related products for component
    const relatedProductsData = relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.url || "/products/placeholder.jpg",
        rating: p.rating ? Number(p.rating) : 0,
        currentPrice: Number(p.sellingPrice || p.basePrice),
        originalPrice: p.mrp ? Number(p.mrp) : undefined,
        discount: p.mrp
            ? Math.round(((Number(p.mrp) - Number(p.sellingPrice || p.basePrice)) / Number(p.mrp)) * 100)
            : undefined,
    }));

    return (
        <div className="min-h-screen bg-white py-8 pb-24 sm:pb-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                {/* Breadcrumbs - Hidden on mobile, shown on tablet and above */}
                <div className="hidden sm:block mb-6">
                    <Breadcrumbs items={breadcrumbs} />
                </div>

                {/* Mobile Breadcrumb - Simple version */}
                <div className="sm:hidden mb-4 text-sm text-gray-600">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-12">
                    {/* Left Column - Product Images (5/12 on desktop) */}
                    <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                        {/* Desktop: Thumbnails and Main Image */}
                        <div className="hidden lg:flex gap-4">
                            {/* Vertical Thumbnails */}
                            {productImages.length > 1 && (
                                <div className="flex flex-col gap-3">
                                    {productImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${currentImageIndex === index
                                                ? "border-blue-600 scale-105 shadow-md"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image Container */}
                            <div className="flex-1">
                                <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
                                        {productImages[currentImageIndex] ? (
                                            <img
                                                src={productImages[currentImageIndex]}
                                                alt={product.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    console.error('Image load error:', productImages[currentImageIndex]);
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    // Show fallback
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.image-fallback')) {
                                                        const fallback = document.createElement('div');
                                                        fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400 bg-gray-100';
                                                        fallback.textContent = product.name || 'Image not available';
                                                        parent.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No image available
                                            </div>
                                        )}

                                        {/* Zoom Indicator */}
                                        <button
                                            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                            onClick={() => {
                                                console.log("Open image zoom");
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.35-4.35"></path>
                                            </svg>
                                        </button>

                                        {/* Image Navigation Controls */}
                                        {productImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImageIndex(prev =>
                                                        prev === 0 ? productImages.length - 1 : prev - 1
                                                    )}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M15 18l-6-6 6-6" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => setCurrentImageIndex(prev =>
                                                        prev === productImages.length - 1 ? 0 : prev + 1
                                                    )}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </button>

                                                {/* Image Counter */}
                                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                                                    {currentImageIndex + 1} / {productImages.length}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* View All Images Button */}
                                    {productImages.length > 4 && (
                                        <div className="mt-4 text-center">
                                            <button className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
                                                View all {productImages.length} images
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Main Image */}
                        <div className="lg:hidden">
                            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
                                    {productImages[currentImageIndex] ? (
                                        <img
                                            src={productImages[currentImageIndex]}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('Image load error:', productImages[currentImageIndex]);
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent && !parent.querySelector('.image-fallback')) {
                                                    const fallback = document.createElement('div');
                                                    fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400 bg-gray-100';
                                                    fallback.textContent = product.name || 'Image not available';
                                                    parent.appendChild(fallback);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No image available
                                        </div>
                                    )}

                                    {/* Mobile Navigation Dots */}
                                    {productImages.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {productImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${currentImageIndex === index
                                                        ? "bg-[#008ECC]"
                                                        : "bg-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Image Counter */}
                                    {productImages.length > 1 && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                                            {currentImageIndex + 1} / {productImages.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Horizontal Scroll Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
                                {productImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${currentImageIndex === index
                                            ? "border-blue-600"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Product Info (7/12 on desktop) */}
                    <div className="lg:col-span-7">
                        <div className="space-y-4 sm:space-y-5">
                            {/* Product Title and Actions */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                                    {product.name}
                                </h1>

                                {/* Rating and Actions Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <ProductRating
                                            rating={product.rating ? Number(product.rating) : 0}
                                            reviewCount={product.totalReviews || 0}
                                        />
                                        <div className="hidden sm:flex items-center gap-4">
                                            <ProductWishlistButton
                                                isWishlisted={isWishlisted}
                                                isLoading={wishlistLoading}
                                                onToggle={toggleWishlist}
                                                showLabel
                                            />
                                            <ProductShareButton
                                                onShare={shareProduct}
                                                onCopy={copyShareLink}
                                                showLabel
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Wishlist Button */}
                                    <div className="sm:hidden">
                                        <ProductWishlistButton
                                            isWishlisted={isWishlisted}
                                            isLoading={wishlistLoading}
                                            onToggle={toggleWishlist}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <PriceDisplay
                                    currentPrice={currentPrice}
                                    originalPrice={originalPrice}
                                    discount={discount}
                                />

                                {/* Stock Status */}
                                {product.stock <= 0 ? (
                                    <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-sm font-medium text-red-800">Out of Stock</span>
                                        </div>
                                        <p className="mt-1 text-xs text-red-600 leading-relaxed">
                                            This product is currently unavailable. Please check back later or contact us for availability.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-green-800">
                                                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'In Stock'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Tax Info */}
                                <div className="mt-2 text-sm text-gray-500 font-medium">
                                    Inclusive of all taxes
                                </div>
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{product.shortDescription}</p>
                                </div>
                            )}

                            {/* Customization Options */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Order</h3>
                                <div className="space-y-5">
                                    {/* Upload Document */}
                                    <ProductDocumentUpload
                                        onFileSelect={handleFileSelect}
                                        maxSizeMB={50}
                                    />

                                    {/* Size/Variant Selector */}
                                    {sizes.length > 0 && (
                                        <SizeSelector
                                            sizes={sizes}
                                            selectedSize={selectedSize}
                                            onSizeChange={handleSizeChange}
                                        />
                                    )}

                                    {/* Page Count & Copies */}
                                    {pageCount > 0 && (
                                        <>
                                            <PageCountDisplay
                                                pageCount={pageCount}
                                                fileType={getFileType(uploadedFileDetails)}
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

                                    {/* Show message when no files uploaded */}
                                    {pageCount === 0 && (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Upload files to see page count and set copies
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons - Desktop */}
                            <div className="hidden sm:block space-y-3">
                                <ProductActions
                                    stock={product.stock}
                                    onAddToCart={onAddToCart}
                                    onBuyNow={onBuyNow}
                                    addToCartLoading={cartLoading || uploadingFiles}
                                    buyNowLoading={buyNowLoading || uploadingFiles}
                                    isInCart={isInCart}
                                    hasFiles={uploadedFiles.length > 0}
                                />
                            </div>

                            {/* Seller Info */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-semibold text-gray-900">Seller</div>
                                    <button className="text-blue-600 text-sm hover:underline cursor-pointer font-medium">
                                        View Details
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-blue-600">P</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">PAGZ Store</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-sm">4.8</span>
                                            </div>
                                            <span className="text-sm text-gray-500">• 95% Positive Feedback</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="mb-12">
                    <ProductTabs tabs={tabs} />
                </div>

                {/* Related Products */}
                {relatedProductsData.length > 0 && (
                    <div className="mb-12">
                        <RelatedProducts products={relatedProductsData} />
                    </div>
                )}

                {/* Fixed Mobile Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg sm:hidden z-50 pb-safe">
                    <div className="flex p-4 gap-3">
                        <ProductActions
                            stock={product.stock}
                            onAddToCart={onAddToCart}
                            onBuyNow={onBuyNow}
                            addToCartLoading={cartLoading}
                            buyNowLoading={buyNowLoading}
                            isMobile
                            isInCart={isInCart}
                            hasFiles={uploadedFiles.length > 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
