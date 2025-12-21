"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex gap-4">
      {/* Thumbnail Images */}
      <div className="flex flex-col gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? "border-blue-600 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Img {index + 1}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Product Image */}
      <div className="flex-1 relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">{productName}</p>
            <p className="text-gray-500 text-sm">Image {selectedImage + 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
