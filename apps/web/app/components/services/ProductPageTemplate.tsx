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
}) => {
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
                                    images={[]} // Pass actual images here
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

                                />
                                <ProductFeatures features={productData.features || []} />
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <PriceBreakdown
                                    items={priceItems}
                                    total={totalPrice}
                                    currency="₹"
                                />

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
                                        disabled={!uploadedFile}
                                        onClick={onAddToCart}
                                        className="text-base"
                                    >
                                        {uploadedFile
                                            ? `Add to Cart - ₹${totalPrice.toFixed(2)}`
                                            : 'Upload File to Continue'
                                        }
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        disabled={!uploadedFile}
                                        onClick={onBuyNow}
                                        className='font-hkgb'
                                    >
                                        Buy Now
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
