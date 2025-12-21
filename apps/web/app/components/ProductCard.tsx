"use client";

import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  brand: string;
  name: string;
  price: number;
  image?: string;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({
  id,
  brand,
  name,
  price,
  image,
  onAddToCart,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative group">
      {/* Product Image */}
      <Link href={`/products/${id}`} className="block relative aspect-square bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-sm">Product Image</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Add to favorites"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isFavorite ? "text-red-500" : "text-gray-600"}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4 pb-14">
        <Link href={`/products/${id}`}>
          <p className="text-sm font-semibold text-gray-900 mb-1">{brand}</p>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{name}</p>
          <p className="text-lg font-bold text-gray-900">${price.toFixed(2)}</p>
        </Link>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors"
        aria-label="Add to cart"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
