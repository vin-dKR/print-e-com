"use client";

import Link from "next/link";
import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import PriceDisplay from "./PriceDisplay";

interface CartItemProps {
  id: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  id,
  name,
  image,
  size,
  color,
  price,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4 relative">
      {/* Delete Button */}
      <button
        onClick={() => onRemove(id)}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Remove item"
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
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>

      {/* Product Image */}
      <Link href={`/products/${id}`} className="shrink-0">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-xs text-gray-400">Image</span>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${id}`}>
            <h3 className="font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
            {size && <span>Size: {size}</span>}
            {color && <span>Color: {color}</span>}
          </div>
          <div className="text-lg font-bold text-gray-900">
            <PriceDisplay currentPrice={price} />
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4">
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={(newQuantity) => onQuantityChange(id, newQuantity)}
          />
        </div>
      </div>
    </div>
  );
}
