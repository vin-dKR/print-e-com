"use client";

import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
}

export default function BestSeller() {
  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Custom Mugs",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/mugs.jpg",
    },
    {
      id: "2",
      name: "Photo Album",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/album.jpg",
    },
    {
      id: "3",
      name: "Tote Bag",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/tote.jpg",
    },
    {
      id: "4",
      name: "Business Cards",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/cards.jpg",
    },
    {
      id: "5",
      name: "Self-Inking Stamps",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/stamps.jpg",
    },
    {
      id: "6",
      name: "Stickers",
      brand: "Velour & Vogue",
      description: "Luminous Lip Velvet...",
      price: 28.99,
      image: "/products/stickers.jpg",
    },
  ]);

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Best Seller</h2>
          <Link
            href="/products?sort=bestseller"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Show More
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {/* Horizontal Scrollable Product Grid */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4" style={{ minWidth: "max-content" }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
              >
                {/* Product Image */}
                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-gray-400 text-sm">Product Image</span>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 pb-14">
                  <Link href={`/products/${product.id}`}>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{product.brand}</p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  </Link>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product.id)}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
