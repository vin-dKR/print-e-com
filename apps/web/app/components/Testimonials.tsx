"use client";

import { BadgeCheck } from "lucide-react";
import { useState, useRef } from "react";

interface Testimonial {
    id: string;
    customerName: string;
    isVerified: boolean;
    rating: number;
    review: string;
}

export default function Testimonials() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [testimonials] = useState<Testimonial[]>([
        {
            id: "1",
            customerName: "Sarah M.",
            isVerified: true,
            rating: 5,
            review: "I'm blown away by the quality and style of the clothes I received from Shapco. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."
        },
        {
            id: "2",
            customerName: "Alex K.",
            isVerified: true,
            rating: 5,
            review: "Finding clothes that align with my personal style used to be a challenge until I discovered Shapco. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
        },
        {
            id: "3",
            customerName: "James L.",
            isVerified: true,
            rating: 5,
            review: "As someone who's always on the lookout for unique fashion gloves, I'm thrilled to have stumbled upon Shapco. The selection of clothes is not only diverse but also on-point with the latest trends."
        },
        {
            id: "4",
            customerName: "Michael T.",
            isVerified: true,
            rating: 5,
            review: "The customer service at Shapco is exceptional! They helped me find the perfect outfit for my wedding anniversary. The attention to detail is remarkable."
        },
        {
            id: "5",
            customerName: "Emma S.",
            isVerified: true,
            rating: 5,
            review: "I've been a loyal customer for over a year now, and every purchase has been a delight. The quality is consistently excellent and the fit is always perfect."
        },
        {
            id: "6",
            customerName: "David R.",
            isVerified: true,
            rating: 5,
            review: "From business suits to casual wear, Shapco has everything I need. The fabrics are premium and the tailoring is impeccable."
        }
    ]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -400,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 400,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-26 bg-white">
            <div className="w-full px-10">
                {/* Section Header with Navigation Buttons in top right */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Our Happy Customers
                        </h2>
                        <p className="text-gray-600 mt-2">
                            See what our customers are saying about us
                        </p>
                    </div>

                    {/* Navigation Buttons in Top Right Corner */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={scrollLeft}
                            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors group"
                            aria-label="Previous testimonials"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-700 group-hover:text-gray-900"
                            >
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-12 h-12 bg-gray-900 hover:bg-black rounded-full flex items-center justify-center transition-colors group"
                            aria-label="Next testimonials"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Testimonials Cards - Horizontal Scroll */}
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto scrollbar-hide"
                    >
                        <div className="flex gap-6 pb-40" style={{ minWidth: "max-content" }}>
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="flex-shrink-0 w-[380px] bg-white border-b border-b-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-100"
                                >
                                    {/* Customer Name with dot (●) */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <h4 className="text-xl font-bold text-gray-900">
                                            {testimonial.customerName}
                                        </h4>
                                        <BadgeCheck size={25} fill="green" strokeWidth={2} color="white" />
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 mb-6">
                                        {Array.from({ length: testimonial.rating }).map((_, index) => (
                                            <svg
                                                key={index}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="text-yellow-500"
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        &ldquo;{testimonial.review}&rdquo;
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
