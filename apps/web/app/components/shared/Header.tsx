"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Groceries");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const categories = [
    "Groceries",
    "Premium Fruits",
    "Home & Kitchen",
    "Fashion",
    "Electronics",
    "Beauty",
    "Home Improvement",
    "Sports, Toys & Luggage",
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      
      // Close category dropdowns when clicking outside
      const clickedInsideCategory = Object.values(categoryRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!clickedInsideCategory) {
        setOpenDropdown(null);
      }
    }

    if (isUserMenuOpen || openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, openDropdown]);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Welcome to worldwide PrintEcom!
            </div>
            <div className="flex items-center gap-4">
              {/* Deliver to */}
              <div className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-gray-600">Deliver to</span>
                <Link href="/addresses" className="text-blue-600 hover:underline font-medium">
                  423651
                </Link>
              </div>

              {/* Separator */}
              <div className="h-4 w-px bg-gray-300"></div>

              {/* Track your order */}
              <Link href="/orders" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
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
                  <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M5 18c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-4M5 18v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M9 6h6"></path>
                </svg>
                <span>Track your order</span>
              </Link>

              {/* Separator */}
              <div className="h-4 w-px bg-gray-300"></div>

              {/* All Offers */}
              <Link href="/offers" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
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
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span>All Offers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-blue-600 rounded-sm transform rotate-12"></div>
              <div className="w-8 h-8 bg-yellow-400 rounded-sm transform -rotate-12 -ml-2"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              PrintEcom
            </span>
          </Link>

          {/* Search Bar */}
          <form
            className="flex-1 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
          >
            <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              {/* Search Icon */}
              <div className="pl-4 pr-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search essentials, groceries and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 px-2 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />

              {/* Category Menu Icon */}
              <button
                type="button"
                className="pr-4 pl-2 text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Categories"
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
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Separator */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Sign Up/Sign In */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-sm font-medium">Sign Up/Sign In</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] overflow-hidden z-50">
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/addresses"
                    className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Addresses
                  </Link>
                  <Link
                    href="/orders"
                    className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/settings"
                    className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="border-gray-200 my-1" />
                  <button className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative"
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
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="text-sm font-medium">Cart</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
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
              >
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              const isOpen = openDropdown === category;
              
              return (
                <div
                  key={category}
                  className="relative shrink-0"
                  ref={(el) => {
                    categoryRefs.current[category] = el;
                  }}
                >
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-blue-600 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      <span>{category}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setOpenDropdown(isOpen ? null : category);
                      }}
                      className={`px-2 py-2 rounded-full font-medium text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-blue-600 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50 py-2">
                      <Link
                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        All {category}
                      </Link>
                      <Link
                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=featured`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Featured Items
                      </Link>
                      <Link
                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=new`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        New Arrivals
                      </Link>
                      <Link
                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=on-sale`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        On Sale
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden flex flex-col px-6 py-4 border-t border-gray-200 bg-white">
          <Link
            href="/"
            className="py-3 text-gray-700 font-medium border-b border-gray-200 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="py-3 text-gray-700 font-medium border-b border-gray-200 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/orders"
            className="py-3 text-gray-700 font-medium border-b border-gray-200 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Orders
          </Link>
          <Link
            href="/profile"
            className="py-3 text-gray-700 font-medium border-b border-gray-200 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/addresses"
            className="py-3 text-gray-700 font-medium border-b border-gray-200 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Addresses
          </Link>
          <Link
            href="/settings"
            className="py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Settings
          </Link>
        </nav>
      )}
    </header>
  );
}
