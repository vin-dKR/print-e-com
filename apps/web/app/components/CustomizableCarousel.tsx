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
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-lg mb-2">{slide.title}</p>
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
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide
                    ? "bg-blue-600"
                    : "bg-blue-200 hover:bg-blue-300"
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
