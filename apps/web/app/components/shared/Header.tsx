"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { BadgePercent, MapPin, ShoppingCart, Truck, User } from "lucide-react";
import Image from "next/image"

export default function Header() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Groceries");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Sync search query with URL params when on products page
    useEffect(() => {
        if (pathname === '/products') {
            const urlSearch = searchParams.get('search') || '';
            setSearchQuery(urlSearch);
        }
    }, [searchParams, pathname]);

    const categories = [
        "Print",
        "Book",
        "Photo",
        "Business Card",
        "Letter Head",
        "BILL BOOK",
        "PAMPLTE",
        "MAP",
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
        <header className="bg-white sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-gray-100">
                <div className="w-full mx-auto px-30 py-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600 text-sm font-light text-xs font-hkgr">
                            Welcome to worldwide Megamart!
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            {/* Delivery PIN Code */}
                            <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                                <MapPin strokeWidth={1} color="#008ECC" size={18} />
                                <span>Deliver to <span className="font-hkgb">423651</span></span>
                            </Link>

                            {/* Separator */}
                            <div className="h-4 w-px bg-gray-300"></div>
                            {/* Track your order */}
                            <Link href="/orders" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                                <Truck strokeWidth={1} color="#008ECC" size={18} />
                                <span>Track your order</span>
                            </Link>

                            {/* Separator */}
                            <div className="h-4 w-px bg-gray-300"></div>

                            {/* All Offers */}
                            <Link href="/offers" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                                <BadgePercent strokeWidth={1} color="#008ECC" size={18} />
                                <span>All Offers</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="w-full mx-auto px-30 py-2">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <Image
                            src="/images/pagz-logo.png"
                            alt="PAGZ logo"
                            width={120}
                            height={120}
                        />
                    </Link>

                    {/* Search Bar */}
                    <form
                        className="flex-1 max-w-3xl"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                            }
                        }}
                    >
                        <div className="relative px-4 py-4 flex items-center bg-[#F3F9FB] rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            {/* Search Icon */}
                            <div className="pl-4 pr-2">
                                <svg
                                    width="25"
                                    height="25"
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
                                placeholder="Search for t-shirts, mugs, posters..."
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
                                    width="25"
                                    height="25"
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

                        {/* Sign Up/Sign In or User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            {loading ? (
                                // Loading state
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <span className="text-sm font-medium">Loading...</span>
                                </div>
                            ) : isAuthenticated ? (
                                // Authenticated User Menu
                                <>
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
                                        <span className="text-sm font-medium">
                                            {user?.name || user?.email || 'Account'}
                                        </span>
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg min-w-[200px] overflow-hidden z-50">
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
                                            <hr className="border-gray-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Not Authenticated - Show Login/Signup Links
                                <>
                                    <button
                                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    >
                                        <User size={22} color="#008ECC" strokeWidth={2} />
                                        <span className="text-sm font-bold font-hkgb">Sign Up/Sign In</span>
                                    </button>

                                    {/* Login/Signup Dropdown */}
                                    {isUserMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg min-w-[200px] overflow-hidden z-50">
                                            <Link
                                                href="/auth/login"
                                                className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/auth/signup"
                                                className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-gray-300"></div>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative"
                        >
                            <ShoppingCart size={22} color="#008ECC" strokeWidth={2} />
                            <span className="text-sm font-bold font-hkgb">Cart</span>


                            {/*
                            // Cart Items count
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                0
                            </span>
                            */}
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
            <div className="border-t border-gray-100 bg-white">
                <div className="w-full px-6 py-6">
                    <div className="flex justify-center items-center gap-6 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => {
                            const isActive = activeCategory === category;
                            const isOpen = openDropdown === category;

                            return (
                                <div
                                    key={category}
                                    className={` flex items-center gap-1.5 px-6 py-3 rounded-2xl font-medium text-sm transition-colors ${isActive
                                        ? "bg-[#008ECC] text-white"
                                        : "bg-[#F3F9FB] text-black hover:bg-gray-100"
                                        }`}
                                    ref={(el) => {
                                        categoryRefs.current[category] = el;
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            <span>{category}</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setOpenDropdown(isOpen ? null : category);
                                            }}
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
                                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg min-w-[200px] z-50 py-2">
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
                <nav className="md:hidden flex flex-col px-6 py-4 border-t border-gray-100 bg-white">
                    <Link
                        href="/"
                        className="py-3 text-gray-700 font-medium border-b border-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/products"
                        className="py-3 text-gray-700 font-medium border-b border-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Products
                    </Link>
                    <Link
                        href="/orders"
                        className="py-3 text-gray-700 font-medium border-b border-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Orders
                    </Link>
                    <Link
                        href="/profile"
                        className="py-3 text-gray-700 font-medium border-b border-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Profile
                    </Link>
                    <Link
                        href="/addresses"
                        className="py-3 text-gray-700 font-medium border-b border-gray-100 hover:text-blue-600 transition-colors"
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
