"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import ProductRating from "../../components/ProductRating";
import PriceDisplay from "../../components/PriceDisplay";
import ProductDocumentUpload from "../../components/products/ProductDocumentUpload";
import ProductWishlistButton from "../../components/products/ProductWishlistButton";
import ProductShareButton from "../../components/products/ProductShareButton";
import ProductActions from "../../components/products/ProductActions";
import SizeSelector from "../../components/SizeSelector";
import QuantitySelector from "../../components/QuantitySelector";
import ProductTabs from "../../components/ProductTabs";
import RelatedProducts from "../../components/RelatedProducts";
import { BarsSpinner } from "../../components/shared/BarsSpinner";
import { useProduct } from "@/hooks/products/useProduct";
import { useCart } from "@/contexts/CartContext";
import { Star } from "lucide-react";
import { uploadOrderFilesToS3 } from "@/lib/api/uploads";

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
    const { isProductInCart } = useCart();
    const isInCart = product ? isProductInCart(product.name) : false;

    // Local UI state
    const [selectedSize, setSelectedSize] = useState<string | undefined>("");
    const [selectedVariant, setSelectedVariant] = useState<string | undefined>("");
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [minQuantityFromFiles, setMinQuantityFromFiles] = useState<number>(1);

    // Set default variant when product loads
    useMemo(() => {
        if (product?.variants && product.variants.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]?.id);
            setSelectedSize(product.variants[0]?.name);
        }
    }, [product, selectedVariant]);

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
            if (quantity < 1) {
                setQuantity(1);
            }
        }

        // Files will be uploaded to S3 when user adds to cart
    };

    // Handle quantity change - prevent decreasing below minimum
    const handleQuantityChange = (newQuantity: number) => {
        const minQty = Math.max(1, minQuantityFromFiles);
        setQuantity(Math.max(newQuantity, minQty));
    };

    // Handle add to cart - upload files to S3 first, then add to cart
    const onAddToCart = async () => {
        if (!product) return;

        // Upload files to S3 if files are present (before adding to cart)
        let s3Keys: string[] = [];
        if (uploadedFiles.length > 0) {
            setUploadingFiles(true);
            try {
                const uploadResponse = await uploadOrderFilesToS3(uploadedFiles);
                if (uploadResponse.success && uploadResponse.data) {
                    s3Keys = uploadResponse.data.files.map(f => f.key);
                } else {
                    alert('Failed to upload files. Please try again.');
                    setUploadingFiles(false);
                    return;
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                alert('Failed to upload files. Please try again.');
                setUploadingFiles(false);
                return;
            } finally {
                setUploadingFiles(false);
            }
        }

        // Add to cart with S3 URLs (handleAddToCart manages cartLoading state)
        const success = await handleAddToCart({
            variantId: selectedVariant,
            quantity,
            customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
        });

        if (success) {
            // Reset uploaded files after adding to cart
            setUploadedFiles([]);
            alert("Product added to cart successfully!");
            // Trigger a page refresh to update cart count
        } else {
            alert("Failed to add product to cart. Please try again.");
        }
    };

    // Handle buy now - upload files to S3 first, then proceed
    const onBuyNow = async () => {
        if (!product) return;

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
                    setUploadingFiles(false);
                    return;
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                alert('Failed to upload files. Please try again.');
                setUploadingFiles(false);
                return;
            } finally {
                setUploadingFiles(false);
            }
        }

        // Add to cart with S3 URLs and redirect to checkout
        const success = await handleBuyNow({
            variantId: selectedVariant,
            quantity,
            customDesignUrl: s3Keys.length > 0 ? s3Keys : undefined,
        });

        if (!success) {
            alert("Failed to proceed. Please try again.");
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
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                Product Reviews (<span>{product.reviews?.length || 0}</span>)
                            </h3>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-lg">
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 hidden sm:inline">
                                    Based on {product.reviews?.length || 0} reviews
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-3">
                                <button
                                    className="p-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 hover:shadow-sm shrink-0 cursor-pointer"
                                    title="Filter by rating"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="4" y1="21" x2="4" y2="14" />
                                        <line x1="4" y1="10" x2="4" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12" y2="3" />
                                        <line x1="20" y1="21" x2="20" y2="16" />
                                        <line x1="20" y1="12" x2="20" y2="3" />
                                        <line x1="1" y1="14" x2="7" y2="14" />
                                        <line x1="9" y1="8" x2="15" y2="8" />
                                        <line x1="17" y1="16" x2="23" y2="16" />
                                    </svg>
                                </button>

                                {/* Custom Select */}
                                <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                                    <select className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
                                        <option value="latest">Latest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="highest">Highest Rating</option>
                                        <option value="lowest">Lowest Rating</option>
                                        <option value="helpful">Most Helpful</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button className="px-4 py-3 bg-[#1EADD8] text-white rounded-full font-hkgb hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow hover:shadow-lg active:scale-[0.98] whitespace-nowrap cursor-pointer">
                                <span className="hidden sm:inline">Write a Review</span>
                                <span className="sm:hidden">Review</span>
                            </button>
                        </div>
                    </div>

                    {/* Reviews Container */}
                    <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.reviews.map((review: any) => (
                                    <div
                                        key={review.id}
                                        className="border border-gray-100 rounded-xl p-4 md:p-5 hover:border-gray-200 transition-all duration-200 hover:shadow-sm bg-white h-fit"
                                    >
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center font-semibold text-blue-600 shrink-0">
                                                    {review.user?.name?.charAt(0) || "A"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-1 mb-1">
                                                        <span className="font-medium text-gray-900 truncate">
                                                            {review.user?.name || "Anonymous"}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                                                    >
                                                                        ★
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {review.date || "Posted recently"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 shrink-0 ml-2 cursor-pointer">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Review Content */}
                                        {review.title && (
                                            <h4 className="font-semibold text-gray-900 mb-2 text-base md:text-lg line-clamp-1">
                                                {review.title}
                                            </h4>
                                        )}

                                        {review.comment && (
                                            <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer text-sm md:text-base">
                                                {review.comment}
                                            </p>
                                        )}

                                        {/* Tags & Actions */}
                                        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                    Verified
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm cursor-pointer">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                    </svg>
                                                    <span>Helpful ({review.helpful || 12})</span>
                                                </button>
                                                <button className="text-gray-600 hover:text-red-600 transition-colors text-sm cursor-pointer">
                                                    Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-600 mb-2">No reviews yet</p>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Be the first to share your thoughts about this product!
                                </p>
                                <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow hover:shadow-lg inline-flex items-center gap-2 cursor-pointer">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    Write the First Review
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {product.reviews && product.reviews.length > 0 && product.reviews.length > 3 && (
                        <div className="pt-4 border-t border-gray-100">
                            <button className="w-full py-3.5 text-center text-blue-600 hover:text-blue-700 font-medium rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] group cursor-pointer">
                                <span className="inline-flex items-center gap-2">
                                    Load More Reviews
                                    <svg
                                        className="w-4 h-4 group-hover:translate-y-1 transition-transform"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    )}
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
        <div className="min-h-screen bg-white py-8">
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

                {/* Main Product Section - Flipkart Style */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Left Column - Product Images (5/12 on desktop) */}
                    <div className="lg:col-span-5">
                        <div className="sticky flex gap-0 lg:gap-4 top-24">
                            {/* Product Images Container */}
                            {productImages.length > 1 && (
                                <div className="lg:order-first lg:w-20">
                                    {/* Desktop: Vertical Thumbnails */}
                                    <div className="hidden lg:flex flex-col gap-3">
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
                                </div>
                            )}

                            <div className="bg-white p-2 rounded-xl border border-gray-200">
                                <div className="relative flex flex-col lg:flex-row gap-4 lg:gap-6">
                                    {/* Main Image Container */}
                                    <div className={`${productImages.length > 1 ? 'lg:flex-1' : 'w-full'}`}>
                                        {/* Main Image */}
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

                                            {/* Zoom Indicator (optional) */}
                                            <button
                                                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                                onClick={() => {
                                                    // Implement zoom/modal view here
                                                    console.log("Open image zoom");
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <path d="m21 21-4.35-4.35"></path>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Image Navigation Controls */}
                                        {productImages.length > 1 && (
                                            <>
                                                {/* Previous Button */}
                                                <button
                                                    onClick={() => setCurrentImageIndex(prev =>
                                                        prev === 0 ? productImages.length - 1 : prev - 1
                                                    )}
                                                    className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M15 18l-6-6 6-6" />
                                                    </svg>
                                                </button>

                                                {/* Next Button */}
                                                <button
                                                    onClick={() => setCurrentImageIndex(prev =>
                                                        prev === productImages.length - 1 ? 0 : prev + 1
                                                    )}
                                                    className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </button>

                                                {/* Mobile Navigation Dots */}
                                                <div className="lg:hidden flex justify-center gap-2 mt-4">
                                                    {productImages.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full cursor-pointer ${currentImageIndex === index
                                                                ? "bg-blue-600"
                                                                : "bg-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Image Counter */}
                                        {productImages.length > 1 && (
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                                                {currentImageIndex + 1} / {productImages.length}
                                            </div>
                                        )}
                                    </div>
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

                    {/* Mobile: Horizontal Scroll Thumbnails */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {productImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer ${currentImageIndex === index
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

                    {/* Right Column - Product Info (7/12 on desktop) */}
                    <div className="lg:col-span-7">
                        <div className="space-y-6">
                            {/* Product Title and Actions */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>

                                {/* Rating and Actions Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
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
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
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
                                        <p className="mt-1 text-xs text-red-600">
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
                                <div className="mt-2 text-sm text-green-600 font-medium">
                                    Inclusive of all taxes
                                </div>
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 text-sm">{product.shortDescription}</p>
                                </div>
                            )}

                            {/* Customization Options */}
                            <div className="space-y-6 border-t border-gray-300 pt-6">
                                {/* Upload Document */}
                                <ProductDocumentUpload
                                    onFileSelect={handleFileSelect}
                                    onQuantityChange={(calculatedQuantity) => {
                                        // Update minimum quantity
                                        if (calculatedQuantity > 0) {
                                            setMinQuantityFromFiles(calculatedQuantity);
                                            // Only auto-update if current quantity is less
                                            if (quantity < calculatedQuantity) {
                                                setQuantity(calculatedQuantity);
                                            }
                                        }
                                    }}
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

                                {/* Quantity Selector */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                                    <QuantitySelector
                                        quantity={quantity}
                                        onQuantityChange={handleQuantityChange}
                                        min={Math.max(product.minOrderQuantity || 1, minQuantityFromFiles)}
                                        max={
                                            product.maxOrderQuantity && product.maxOrderQuantity > 0
                                                ? Math.min(product.maxOrderQuantity, product.stock)
                                                : product.stock
                                        }
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Min order: {Math.max(product.minOrderQuantity || 1, minQuantityFromFiles)}
                                        {product.maxOrderQuantity
                                            ? ` • Max per order: ${product.maxOrderQuantity}`
                                            : ''}
                                        {uploadedFiles.length > 0 && minQuantityFromFiles > 1 && (
                                            <span className="block mt-1 text-blue-600">
                                                Minimum quantity: {minQuantityFromFiles} (based on uploaded files)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons - Desktop */}
                            <div className="hidden sm:flex gap-4 pt-6 border-t border-gray-300">
                                <ProductActions
                                    stock={product.stock}
                                    onAddToCart={onAddToCart}
                                    onBuyNow={onBuyNow}
                                    addToCartLoading={cartLoading || uploadingFiles}
                                    buyNowLoading={buyNowLoading || uploadingFiles}
                                    isInCart={isInCart}
                                />
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-gray-900">Seller</div>
                                    <button className="text-blue-600 text-sm hover:underline cursor-pointer">
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
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg sm:hidden z-50">
                    <div className="flex p-4 gap-3">
                        <ProductActions
                            stock={product.stock}
                            onAddToCart={onAddToCart}
                            onBuyNow={onBuyNow}
                            addToCartLoading={cartLoading || uploadingFiles}
                            buyNowLoading={buyNowLoading || uploadingFiles}
                            isMobile
                            isInCart={isInCart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
