"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProducts, type Product } from "../../lib/api/products";

export default function PopularProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    console.log("---- products fetch in PopularProducts", products)
    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                setLoading(true);
                const response = await getProducts({
                    // isFeatured: true,
                    limit: 8,
                    page: 1,
                });

                if (response.success && response.data) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error("Failed to fetch popular products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularProducts();
    }, []);

    const handleAddToCart = (productId: string) => {
        // Handle add to cart logic (will be implemented in Phase 2)
        console.log("Add to cart:", productId);
    };

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-12 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-6 pb-4">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // No products message
    if (!loading && products.length === 0) {
        return null; // Don't show section if no products
    }

    return (
        <section className="py-12 bg-white">
            <div className="w-full px-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Popular Products</h2>
                    <Link
                        href="/products"
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
                                className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
                            >
                                {/* Product Image */}
                                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]?.url || ''}
                                            alt={product.images[0]?.alt || product.name || ''}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={'/images/pagz-logo.png'}
                                            alt={''}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </Link>
                                {/*
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                    </div>
                                    */}

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/products/${product.id}`}>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {product.shortDescription || product.name}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {product.category?.name || "Unknown category"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {product.sellingPrice && product.sellingPrice < product.basePrice ? (
                                                <>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        ₹{Number(product.sellingPrice).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-400 line-through">
                                                        ₹{Number(product.basePrice).toFixed(2)}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-gray-900">
                                                    ₹{Number(product.basePrice).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => handleAddToCart(product.id)}
                                    className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors"
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
