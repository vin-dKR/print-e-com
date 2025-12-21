"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Visiting Card", href: "/products?category=visiting-card" },
    { name: "T shirt", href: "/products?category=t-shirt" },
    { name: "Business Profile", href: "/products?category=business-profile" },
    { name: "Accessories", href: "/products?category=accessories" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('/printer-bg.jpg')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 font-serif italic">
          Change Your wardrobe. Find exciting goods.
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center bg-white rounded-full shadow-lg max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full outline-none text-gray-900 placeholder:text-gray-400 text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Search"
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
                className="text-white"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </form>

        {/* Category Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
