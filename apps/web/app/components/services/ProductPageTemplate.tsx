'use client';

import React from 'react';
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import { ProductFeatures } from './ProductFeatures';
import { ProductFileUpload } from './print/FileUpload';
import { PriceBreakdown } from './print/PriceBreakdown';
import { Button } from './print/Button';
import { ShoppingCart } from 'lucide-react';
import { ProductData, BreadcrumbItem } from '@/types';
import { Breadcrumb } from '../ui/Breadcrumb';
import Breadcrumbs from '../Breadcrumbs';
import { useRouter } from 'next/navigation';
import ProductDocumentUpload from '../products/ProductDocumentUpload';

interface ProductPageTemplateProps {
    productData: Partial<ProductData>;
    breadcrumbItems: BreadcrumbItem[];
    uploadedFile: File | null;
    onFileSelect: (file: File | null) => void;
    onFileRemove: () => void;
    onFileSelectWithQuantity?: (files: File[], totalQuantity: number) => void;
    onQuantityChange?: (quantity: number) => void;
    priceItems: Array<{ label: string; value: number; description?: string }>;
    totalPrice: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    addToCartLoading?: boolean;
    buyNowLoading?: boolean;
    isInCart?: boolean;
    children: React.ReactNode;
    stock?: number | null;
    isOutOfStock?: boolean;
    productId?: string | null;
    images?: Array<{ id: string; src: string; alt: string; thumbnailSrc?: string }>;
    minQuantity?: number;
}

export const ProductPageTemplate: React.FC<ProductPageTemplateProps> = ({
    productData,
    breadcrumbItems,
    uploadedFile,
    onFileSelect,
    onFileRemove,
    onFileSelectWithQuantity,
    onQuantityChange,
    priceItems,
    totalPrice,
    onAddToCart,
    onBuyNow,
    addToCartLoading = false,
    buyNowLoading = false,
    isInCart = false,
    children,
    stock,
    isOutOfStock = false,
    productId,
    images = [],
    minQuantity = 1,
}) => {
    const router = useRouter();

    // Transform breadcrumb items to match Breadcrumbs component format
    const breadcrumbsFormatted = breadcrumbItems.map(item => ({
        label: item.label,
        href: item.href,
        isActive: item.isActive
    }));

    const outOfStock = isOutOfStock || (stock !== null && stock !== undefined && stock <= 0);
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                {/* Breadcrumbs - Hidden on mobile, shown on tablet and above */}
                <div className="hidden sm:block mb-6">
                    <Breadcrumbs items={breadcrumbsFormatted} />
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

                {/* Main Product Section - Matching product detail layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Left Column - Product Images & Configuration (7/12 on desktop) */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                            {/* Product Gallery */}
                            <div className="bg-white p-2 rounded-xl border border-gray-200">
                                <ProductGallery
                                    images={images}
                                    fallbackIcon={<ShoppingCart className="w-24 h-24 text-[#008ECC]" />}
                                />
                            </div>

                            {/* File Upload Section */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                                <ProductDocumentUpload
                                    onFileSelect={(files: File[], totalQuantity: number) => {
                                        // Use the new callback if provided, otherwise use legacy callback
                                        if (onFileSelectWithQuantity) {
                                            onFileSelectWithQuantity(files, totalQuantity);
                                        } else {
                                            // Legacy: pass first file to onFileSelect
                                            const firstFile: File | null = files.length > 0 && files[0] ? files[0] : null;
                                            onFileSelect(firstFile);
                                        }
                                    }}
                                    onQuantityChange={(calculatedQuantity: number) => {
                                        // Call the quantity change callback if provided
                                        if (onQuantityChange && calculatedQuantity > 0) {
                                            onQuantityChange(calculatedQuantity);
                                        }
                                    }}
                                    maxSizeMB={50}
                                />
                            </div>

                            {/* Configuration Options */}
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Order</h3>
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Info & Pricing (5/12 on desktop) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            {/* Product Title */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {productData.title || 'Service'}
                                </h1>
                                {productData.description && (
                                    <p className="text-gray-600 text-sm mt-2">
                                        {productData.description}
                                    </p>
                                )}
                            </div>

                            {/* Price Section */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                                <PriceBreakdown
                                    items={priceItems}
                                    total={totalPrice}
                                    currency="₹"
                                />

                                {/* Stock Status */}
                                {productId && (
                                    <div className="mt-4">
                                        {outOfStock ? (
                                            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-red-800">Out of Stock</span>
                                                </div>
                                                <p className="mt-1 text-xs text-red-600">
                                                    This product is currently unavailable. Please check back later or contact us for availability.
                                                </p>
                                            </div>
                                        ) : stock !== null && stock !== undefined ? (
                                            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-green-800">
                                                        {stock > 0 ? `In Stock (${stock} available)` : 'In Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                                {/* Tax Info */}
                                <div className="mt-2 text-sm text-green-600 font-medium">
                                    Inclusive of all taxes
                                </div>
                            </div>

                            {/* Features */}
                            {productData.features && productData.features.length > 0 && (
                                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                                    <ProductFeatures features={productData.features} />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    icon={ShoppingCart}
                                    fullWidth
                                    disabled={(!uploadedFile && !onFileSelectWithQuantity) || outOfStock}
                                    onClick={isInCart ? () => router.push('/cart') : onAddToCart}
                                    className="text-base"
                                >
                                    {outOfStock
                                        ? 'Out of Stock'
                                        : (!uploadedFile && !onFileSelectWithQuantity)
                                            ? 'Upload File to Continue'
                                            : isInCart
                                                ? 'Go to Cart'
                                                : `Add to Cart - ₹${totalPrice.toFixed(2)}`
                                    }
                                </Button>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    disabled={(!uploadedFile && !onFileSelectWithQuantity) || outOfStock}
                                    onClick={onBuyNow}
                                    className='font-hkgb'
                                >
                                    {outOfStock ? 'Out of Stock' : 'Buy Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Mobile Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg sm:hidden z-50">
                <div className="flex p-4 gap-3">
                    <button
                        onClick={isInCart ? () => router.push('/cart') : onAddToCart}
                        disabled={(!uploadedFile && !onFileSelectWithQuantity) || (isInCart ? false : addToCartLoading)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                        {(!uploadedFile && !onFileSelectWithQuantity)
                            ? 'Upload File'
                            : isInCart
                                ? 'Go to Cart'
                                : addToCartLoading
                                    ? 'Adding...'
                                    : 'Add to Cart'
                        }
                    </button>
                    <button
                        onClick={onBuyNow}
                        disabled={(!uploadedFile && !onFileSelectWithQuantity) || buyNowLoading}
                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {buyNowLoading ? 'Processing...' : 'Buy Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};
