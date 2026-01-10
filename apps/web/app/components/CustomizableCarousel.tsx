"use client";

import { useState } from "react";

export default function CustomizableCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            image: "/carousel/custom-prints-1.jpg",
            title: "Custom Art Prints & Stickers",
        },
        {
            id: 2,
            image: "/carousel/bottle-family.jpg",
            title: "Personalized Bottles",
        },
        {
            id: 3,
            image: "/carousel/bottle-logo.jpg",
            title: "Branded Bottles",
        },
    ];

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <section className="py-10 bg-white relative">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                <div className="relative">
                    {/* Carousel Container */}
                    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                    <div className="text-center px-4">
                                        <p className="text-gray-600 text-base sm:text-lg mb-2 font-medium">{slide.title}</p>
                                        <p className="text-gray-500 text-sm">Slide {index + 1}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${index === currentSlide
                                    ? "bg-[#008ECC] w-8"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
