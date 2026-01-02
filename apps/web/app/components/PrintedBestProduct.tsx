"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProducts, type Product } from "../../lib/api/products";

export default function PrintedBestProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                setLoading(true);
                const response = await getProducts({
                    isNewArrival: true,
                    limit: 4,
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

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // No products message
    if (!loading && products.length === 0) {
        return null; // Don't show section if no products
    }

    // Show placeholders for remaining slots if less than 4 products
    const displayProducts = [...products];
    while (displayProducts.length < 4) {
        displayProducts.push(null as any);
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
                    <Link
                        href="/products?isNewArrival=true"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        View All
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, index) => (
                        product ? (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                {/* Product Image */}
                                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
                                    {product.images && product.images.length > 0 && product.images[0] ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.images[0].alt || product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        </div>
                                    )}
                                    {/* New Arrival Badge */}
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        NEW
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/products/${product.id}`}>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {product.brand?.name || "Unknown Brand"}
                                        </p>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
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
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={index}
                                className="bg-gray-900 rounded-lg p-6 relative overflow-hidden"
                            >
                                {/* Placeholder collage for empty slots */}
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="col-span-2 row-span-2 bg-white rounded p-2">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center">
                                            <span className="text-xs text-gray-600 font-semibold">NEW</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 rounded"></div>
                                    <div className="bg-yellow-50 rounded"></div>
                                    <div className="bg-white rounded"></div>
                                    <div className="bg-amber-50 rounded"></div>
                                    <div className="bg-red-100 rounded"></div>
                                    <div className="bg-gray-800 rounded"></div>
                                    <div className="col-span-2 bg-white rounded"></div>
                                </div>
                                <Link
                                    href="/products?isNewArrival=true"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                                >
                                    See New Arrivals
                                </Link>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
}
