'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Expand, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    images: Array<{
        id: string;
        src: string;
        alt: string;
        thumbnailSrc?: string;
    }>;
    fallbackIcon?: React.ReactNode;
    className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
    images,
    fallbackIcon,
    className,
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Main Image */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
                {images.length > 0 ? (
                    <>
                        <Image
                            src={images[selectedImageIndex].src}
                            alt={images[selectedImageIndex].alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                            </>
                        )}
                        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors">
                            <Expand className="w-5 h-5 text-gray-700" />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {fallbackIcon || (
                            <div className="text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 text-[#008ECC] mx-auto mb-4">
                                    {fallbackIcon}
                                </div>
                                <h3 className="font-hkgb text-lg sm:text-xl text-gray-900">
                                    Product Preview
                                </h3>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={cn(
                                'relative h-20 sm:h-24 rounded-lg border overflow-hidden transition-all duration-200',
                                selectedImageIndex === index
                                    ? 'border-[#008ECC] ring-2 ring-[#008ECC] ring-offset-2'
                                    : 'border-gray-200 hover:border-gray-300'
                            )}
                        >
                            <Image
                                src={image.thumbnailSrc || image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 25vw, 16vw"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
