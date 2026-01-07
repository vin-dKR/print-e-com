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

interface ProductPageTemplateProps {
    productData: Partial<ProductData>;
    breadcrumbItems: BreadcrumbItem[];
    uploadedFile: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    priceItems: Array<{ label: string; value: number; description?: string }>;
    totalPrice: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    children: React.ReactNode;
    stock?: number | null;
    isOutOfStock?: boolean;
    productId?: string | null;
    images?: Array<{ id: string; src: string; alt: string; thumbnailSrc?: string }>;
}

export const ProductPageTemplate: React.FC<ProductPageTemplateProps> = ({
    productData,
    breadcrumbItems,
    uploadedFile,
    onFileSelect,
    onFileRemove,
    priceItems,
    totalPrice,
    onAddToCart,
    onBuyNow,
    children,
    stock,
    isOutOfStock = false,
    productId,
    images = [],
}) => {
    const outOfStock = isOutOfStock || (stock !== null && stock !== undefined && stock <= 0);
    return (
        <div>
            <div className="h-full mb-6 lg:mb-40 bg-gray-50">
                {/* Breadcrumb */}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <div className="pb-4">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Column - Product Info & Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <ProductGallery
                                    images={images}
                                    fallbackIcon={<ShoppingCart className="w-24 h-24 text-[#008ECC]" />}
                                />

                            </div>

                            {/* Configuration Options */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                {children}
                            </div>
                        </div>

                        {/* Right Column - Price & Checkout */}
                        <div className="flex flex-col gap-4 sticky top-6">

                            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6'>
                                <ProductHeader
                                    title={productData.title || ''}
                                    subtitle={productData.description}
                                    breadcrumbItems={breadcrumbItems}
                                />
                                <ProductFeatures features={productData.features || []} />
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
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

                                <div className="mt-6">
                                    <ProductFileUpload
                                        onFileSelect={onFileSelect}
                                        uploadedFile={uploadedFile}
                                        onRemove={onFileRemove}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        title="Upload Your File"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={ShoppingCart}
                                        fullWidth
                                        disabled={!uploadedFile || outOfStock}
                                        onClick={onAddToCart}
                                        className="text-base"
                                    >
                                        {outOfStock
                                            ? 'Out of Stock'
                                            : uploadedFile
                                                ? `Add to Cart - ₹${totalPrice.toFixed(2)}`
                                                : 'Upload File to Continue'
                                        }
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        disabled={!uploadedFile || outOfStock}
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
            </div>
        </div>
    );
};
