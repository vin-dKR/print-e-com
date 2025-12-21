"use client";

import { useState } from "react";

interface Testimonial {
  id: string;
  customerName: string;
  isVerified: boolean;
  rating: number;
  review: string;
}

export default function Testimonials() {
  const [testimonials] = useState<Testimonial[]>([
    {
      id: "1",
      customerName: "Sarah M.",
      isVerified: true,
      rating: 5,
      review:
        "I absolutely love shopping at Shop.co! The quality of the products is outstanding, and the styles are always on point. Highly recommend!",
    },
    {
      id: "2",
      customerName: "Alex K.",
      isVerified: true,
      rating: 5,
      review:
        "I absolutely love shopping at Shop.co! The quality of the products is outstanding, and the styles are always on point. Highly recommend!",
    },
    {
      id: "3",
      customerName: "James L.",
      isVerified: true,
      rating: 5,
      review:
        "I absolutely love shopping at Shop.co! The quality of the products is outstanding, and the styles are always on point. Highly recommend!",
    },
    {
      id: "4",
      customerName: "Emily R.",
      isVerified: true,
      rating: 5,
      review:
        "I absolutely love shopping at Shop.co! The quality of the products is outstanding, and the styles are always on point. Highly recommend!",
    },
  ]);

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4" style={{ minWidth: "max-content" }}>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <svg
                      key={index}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-400"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>

                {/* Customer Name & Verification */}
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-bold text-gray-900">{testimonial.customerName}</h4>
                  {testimonial.isVerified && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  &ldquo;{testimonial.review}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonials"
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
              className="text-gray-700"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next testimonials"
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
              className="text-gray-700"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
