"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProducts, type Product } from "../../lib/api/products";

export default function NewArrivalProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const response = await getProducts({
                    isNewArrival: true,
                    limit: 8,
                    page: 1,
                });

                if (response.success && response.data) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error("Failed to fetch new arrivals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    const handleAddToCart = (productId: string) => {
        // Handle add to cart logic (will be implemented in Phase 2)
        console.log("Add to cart:", productId);
    };

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-10 bg-white">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4 sm:gap-6 pb-4">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="shrink-0 w-64 h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
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
        <section className="py-10 bg-white">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">New Arrivals</h2>
                    <Link
                        href="/products?isNewArrival=true"
                        className="flex items-center gap-2 text-[#008ECC] hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
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
                    <div className="flex gap-4 sm:gap-6 pb-4" style={{ minWidth: "max-content" }}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="shrink-0 w-64 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative"
                            >
                                {/* Product Image */}
                                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-50 rounded-t-2xl overflow-hidden">
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
                                    {/* New Arrival Badge */}
                                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                                        NEW
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/products/${product.id}`}>
                                        <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                            {product.shortDescription || product.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2">
                                            {product.category?.name || "Unknown category"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {product.sellingPrice && product.sellingPrice < product.basePrice ? (
                                                <>
                                                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                                                        ₹{Number(product.sellingPrice).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-400 line-through">
                                                        ₹{Number(product.basePrice).toFixed(2)}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-base sm:text-lg font-semibold text-gray-900">
                                                    ₹{Number(product.basePrice).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => handleAddToCart(product.id)}
                                    className="absolute bottom-4 right-4 w-10 h-10 bg-[#008ECC] hover:bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-sm hover:shadow transition-all duration-200"
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
