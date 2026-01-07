"use client";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllCategories, type Category } from '@/lib/api/categories';

// Color gradients for category cards (cycling through these)
const colorGradients = [
    "from-blue-900/90 to-blue-700/90",
    "from-purple-900/90 to-purple-700/90",
    "from-amber-900/90 to-amber-700/90",
    "from-emerald-900/90 to-emerald-700/90",
    "from-red-900/90 to-red-700/90",
    "from-indigo-900/90 to-indigo-700/90",
    "from-pink-900/90 to-pink-700/90",
    "from-teal-900/90 to-teal-700/90",
];

export default function CategoryProducts() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllCategories();
                // Take first 4 categories for the main display
                setCategories(data.slice(0, 4));
            } catch (err: any) {
                console.error('Failed to fetch categories:', err);
                setError(err.message || 'Failed to load categories');
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    // Map category to product format
    const getCategoryImage = (category: Category): string => {
        // Use primary image if available
        if (category.images && category.images.length > 0 && category.images[0]) {
            return category.images[0].url;
        }
        // Fallback to legacy image field
        if (category.image) {
            return category.image;
        }
        // Default placeholder
        return "/images/rows/row1.png";
    };

    const getCategoryColor = (index: number): string => {
        const gradientIndex = index % colorGradients.length;
        const gradient = colorGradients[gradientIndex];
        return gradient ?? colorGradients[0] ?? "from-blue-900/90 to-blue-700/90";
    };

    const getCategoryAction = (categoryName: string): string => {
        // Generate action text from category name
        if (categoryName.toLowerCase().includes('print')) {
            return 'Print Now';
        }
        if (categoryName.toLowerCase().includes('book')) {
            return 'Print Books';
        }
        if (categoryName.toLowerCase().includes('photo')) {
            return 'Print Photos';
        }
        if (categoryName.toLowerCase().includes('map')) {
            return 'Print Maps';
        }
        return 'View Service';
    };

    if (loading) {
        return (
            <section className="py-10 bg-white">
                <div className="w-full mx-auto px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative h-100 rounded-4xl overflow-hidden bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || categories.length === 0) {
        return (
            <section className="py-10 bg-white">
                <div className="w-full mx-auto px-10">
                    <div className="text-center text-gray-500">
                        <p>{error || 'No categories available'}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 bg-white">
            <div className="w-full mx-auto px-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
                    <Link
                        href="/services"
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
                    >
                        See All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {categories.map((category, index) => {
                        const imageUrl = getCategoryImage(category);
                        const color = getCategoryColor(index);
                        const action = getCategoryAction(category.name);

                        return (
                            <Link
                                href={`/services/${category.slug}`}
                                key={category.id}
                                className="relative group h-100 rounded-4xl overflow-hidden cursor-pointer"
                                onMouseEnter={() => setHoveredCard(category.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Background Image with Zoom */}
                                <div className="absolute inset-0">
                                    <div
                                        className={`w-full h-full bg-cover bg-center transition-transform duration-700 ${hoveredCard === category.id ? 'scale-110' : 'scale-100'
                                            }`}
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />
                                </div>

                                {/* Title Overlay - Always at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="text-xl font-bold text-white">
                                        {category.name}
                                    </h3>
                                </div>

                                {/* Hover Overlay - Slides up from bottom */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 top-auto h-full bg-gradient-to-t ${color} transition-all duration-500 ${hoveredCard === category.id
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-full opacity-0'
                                        }`}
                                >
                                    <div className="h-full flex flex-col justify-center items-center p-6">
                                        {/* Description */}
                                        <p className="text-white text-center mb-6 leading-relaxed">
                                            {category.description || `${category.name} services with professional quality and fast delivery.`}
                                        </p>

                                        {/* CTA Button */}
                                        <button className="bg-white text-gray-900 py-3 px-6 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 transform hover:scale-105 transition-transform">
                                            {action}
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
