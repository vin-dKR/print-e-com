"use client";
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function AnimatedProductCards() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const products = [
        {
            id: 1,
            title: "Printout Services",
            description: "Professional printing in all sizes with various paper qualities and lamination options.",
            action: "Print Now",
            imageUrl: "/images/rows/row1.png",
            color: "from-blue-900/90 to-blue-700/90"
        },
        {
            id: 2,
            title: "Book Printing",
            description: "Complete book printing and binding solutions for publishing and educational needs.",
            action: "Print Books",
            imageUrl: "/images/rows/row2.png",
            color: "from-purple-900/90 to-purple-700/90"
        },
        {
            id: 3,
            title: "Photo Printing",
            description: "High-quality glossy and matt photo prints in all standard sizes with professional finishing.",
            action: "Print Photos",
            imageUrl: "/images/rows/row3.png",
            color: "from-amber-900/90 to-amber-700/90"
        },
        {
            id: 4,
            title: "Map Printing",
            description: "Large format map printing for architects and businesses with lamination for durability.",
            action: "Print Maps",
            imageUrl: "/images/rows/row4.png",
            color: "from-emerald-900/90 to-emerald-700/90"
        }
    ];

    return (
        <section className="py-10 bg-white">
            <div className="w-full mx-auto px-10">
                {/*
                <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                Printed Best Products
                </h1>
                */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative group h-100 rounded-4xl overflow-hidden cursor-pointer"
                            onMouseEnter={() => setHoveredCard(product.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Background Image with Zoom */}
                            <div className="absolute inset-0">
                                <div
                                    className={`w-full h-full bg-cover bg-center transition-transform duration-700 ${hoveredCard === product.id ? 'scale-110' : 'scale-100'
                                        }`}
                                    style={{ backgroundImage: `url(${product.imageUrl})` }}
                                />
                            </div>

                            {/* Title Overlay - Always at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-bold text-white">
                                    {product.title}
                                </h3>
                            </div>

                            {/* Hover Overlay - Slides up from bottom */}
                            <div
                                className={`absolute inset-x-0 bottom-0 top-auto h-full bg-gradient-to-t ${product.color} transition-all duration-500 ${hoveredCard === product.id
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-full opacity-0'
                                    }`}
                            >
                                <div className="h-full flex flex-col justify-center items-center p-6">
                                    {/* Description */}
                                    <p className="text-white text-center mb-6 leading-relaxed">
                                        {product.description}
                                    </p>

                                    {/* CTA Button */}
                                    <button className="bg-white text-gray-900 py-3 px-6 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 transform hover:scale-105 transition-transform">
                                        {product.action}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
