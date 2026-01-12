"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { BadgePercent, ShoppingCart, Truck, User, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

// Component that uses useSearchParams - must be wrapped in Suspense
function SearchParamsSync({
    searchQuery,
    setSearchQuery
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Sync search query with URL params when on products page
    useEffect(() => {
        if (pathname === '/products') {
            const urlSearch = searchParams.get('search') || '';
            if (urlSearch === "All") {
                setSearchQuery("");
            } else {
                setSearchQuery(urlSearch);
            }
        }
    }, [searchParams, pathname, setSearchQuery]);

    return null;
}

export default function Header() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const { items: cartItems } = useCart();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [isCategoryVisible, setIsCategoryVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const headerRef = useRef<HTMLElement>(null);
    const categoryBarRef = useRef<HTMLDivElement>(null);

    // Calculate unique product count (number of items, not total quantity)
    const cartItemCount = cartItems.length;

    const categories = [
        "All",
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
        }

        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    // Reset active category when navigating away from products page
    useEffect(() => {
        if (!pathname.includes('/products')) {
            setActiveCategory(null);
        }
    }, [pathname]);

    // Hide/show category bar on scroll
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;

            // Show category bar at the top of the page
            if (currentScrollY < 100) {
                setIsCategoryVisible(true);
            }
            // Hide category bar when scrolling down
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsCategoryVisible(false);
            }
            // Show category bar when scrolling up
            else if (currentScrollY < lastScrollY) {
                setIsCategoryVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlHeader);
        return () => window.removeEventListener('scroll', controlHeader);
    }, [lastScrollY]);

    return (
        <header className="sticky top-0 z-50" ref={headerRef}>
            <Suspense fallback={null}>
                <SearchParamsSync searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </Suspense>
            {/* Top Bar - Hide on mobile */}
            <div className="hidden lg:block bg-gray-100">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-600 text-xs font-light font-hkgr">
                            Welcome to worldwide Megamart!
                        </div>
                        <div className="flex items-center gap-3 text-xs">

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
            <div className="bg-white w-full">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-3 sm:gap-4 py-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <Image
                                src="/images/pagz-logo.png"
                                alt="PAGZ logo"
                                width={72}
                                height={72}
                                className="w-16 h-16 lg:w-20 lg:h-20"
                            />
                        </Link>

                        {/* Search Bar - Desktop only */}
                        <form
                            className="hidden sm:flex flex-1 max-w-2xl gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchQuery.trim()) {
                                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                                }
                            }}
                        >
                            <div className="relative px-2.5 py-1.5 flex items-center bg-[#F3F9FB] rounded-lg border border-gray-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-100 transition-all flex-1">
                                {/* Search Icon */}
                                <div className="pl-1 pr-1.5">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-gray-400"
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 py-1 px-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B5] transition-colors font-medium text-xs whitespace-nowrap"
                                disabled={!searchQuery.trim()}
                            >
                                Search
                            </button>
                        </form>

                        {/* Mobile Search Modal */}
                        {isSearchOpen && (
                            <div className="sm:hidden fixed inset-0 z-50 bg-white">
                                <div className="flex flex-col h-full">
                                    {/* Search Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                                        <form
                                            className="flex-1 flex gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (searchQuery.trim()) {
                                                    setIsSearchOpen(false);
                                                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                                                }
                                            }}
                                        >
                                            <div className="relative flex-1 flex items-center bg-[#F3F9FB] rounded-lg border border-gray-200 px-3 py-2">
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-gray-400 mr-2"
                                                >
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <path d="m21 21-4.35-4.35"></path>
                                                </svg>
                                                <input
                                                    type="text"
                                                    placeholder="Search for products..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B5] transition-colors font-medium"
                                                disabled={!searchQuery.trim()}
                                            >
                                                Search
                                            </button>
                                        </form>
                                        <button
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            aria-label="Close search"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

                            {/* Sign Up/Sign In or User Menu - Hide on mobile, show from sm */}
                            <div className="hidden sm:block relative" ref={userMenuRef}>
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
                                            <span className="text-sm font-medium hidden lg:inline">
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
                                            <span className="text-sm font-bold font-hkgb hidden lg:inline">Sign Up/Sign In</span>
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

                            {/* Separator - Hide on mobile */}
                            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

                            {/* Cart - Hide on mobile, show from sm */}
                            <Link
                                href="/cart"
                                className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative p-2"
                            >
                                <ShoppingCart size={22} color="#008ECC" strokeWidth={2} />
                                <span className="text-sm font-bold font-hkgb hidden lg:inline">Cart</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Search Button */}
                            <button
                                className="sm:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setIsSearchOpen(true)}
                                aria-label="Search"
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
                                    className="text-blue-600"
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                className="sm:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Navigation Bar - Responsive and scrollable - Hidden on auth pages */}
            {!pathname?.startsWith("/auth") && (
                <div
                    ref={categoryBarRef}
                    className={`bg-white border-t border-gray-100 transition-all duration-300 ${isCategoryVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
                        }`}
                >
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-b border-gray-100">
                        <div className="flex xl:justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
                            <div className="flex items-center gap-2 lg:gap-4 min-w-max">
                                {categories.map((category) => {
                                    const isActive = activeCategory === category;
                                    const isHovered = hoveredCategory === category;

                                    return (
                                        <div
                                            key={category}
                                            className={`relative flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${isActive
                                                ? "bg-[#008ECC] text-white"
                                                : isHovered
                                                    ? "bg-[#008ECC]/80 text-white"
                                                    : "bg-[#F3F9FB] text-black"
                                                }`}
                                            onMouseEnter={() => setHoveredCategory(category)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                            ref={(el) => {
                                                categoryRefs.current[category] = el;
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                                                    onClick={() => setActiveCategory(category)}
                                                    className="text-xs lg:text-sm"
                                                >
                                                    {category}
                                                </Link>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform shrink-0 ${isHovered ? "rotate-180" : ""}`}
                                                />
                                            </div>

                                            {/* Dropdown Menu - Shows on Hover */}
                                            {isHovered && (
                                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg min-w-[180px] z-50 py-2">
                                                    <Link
                                                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            setActiveCategory(category);
                                                            setHoveredCategory(null);
                                                        }}
                                                    >
                                                        All {category}
                                                    </Link>
                                                    <Link
                                                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=featured`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            setActiveCategory(category);
                                                            setHoveredCategory(null);
                                                        }}
                                                    >
                                                        Featured Items
                                                    </Link>
                                                    <Link
                                                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=new`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            setActiveCategory(category);
                                                            setHoveredCategory(null);
                                                        }}
                                                    >
                                                        New Arrivals
                                                    </Link>
                                                    <Link
                                                        href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}&subcategory=on-sale`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            setActiveCategory(category);
                                                            setHoveredCategory(null);
                                                        }}
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
                </div>
            )}

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 sm:hidden">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl animate-slideIn">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">Menu</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* User Section */}
                            {loading ? (
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <span className="text-sm font-medium">Loading...</span>
                                </div>
                            ) : isAuthenticated ? (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-medium">{user?.name || user?.email}</p>
                                    <p className="text-sm text-gray-600">Welcome back!</p>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <Link
                                        href="/auth/login"
                                        className="block w-full mb-2 px-4 py-3 bg-[#008ECC] text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="block w-full px-4 py-3 border border-blue-600 text-blue-600 text-center rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Search Bar for Mobile */}
                            <div className="mb-6">
                                <div className="relative px-4 py-3 flex items-center bg-[#F3F9FB] rounded-lg">
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
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 py-2 px-3 bg-transparent outline-none text-gray-700"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim()) {
                                                setIsMenuOpen(false);
                                                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-2">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Home
                                </Link>

                                <Link
                                    href="/products"
                                    className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                    All Products
                                </Link>

                                {/* Categories in Mobile Menu */}
                                <div className="pt-2">
                                    <p className="px-4 py-2 text-sm font-medium text-gray-500">Categories</p>
                                    {categories.map((category) => (
                                        <Link
                                            key={category}
                                            href={`/products?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="flex items-center gap-3 py-2 px-8 text-gray-700 hover:text-blue-600 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                </div>

                                {isAuthenticated && (
                                    <>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            Profile
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                                            </svg>
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/addresses"
                                            className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            Addresses
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-3 py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                            </svg>
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 py-3 px-4 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                            Logout
                                        </button>
                                    </>
                                )}
                            </nav>

                            {/* Mobile Top Bar Links */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="space-y-3">
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-3 py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Truck strokeWidth={1} color="#008ECC" size={18} />
                                        <span>Track your order</span>
                                    </Link>
                                    <Link
                                        href="/offers"
                                        className="flex items-center gap-3 py-2 px-4 text-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <BadgePercent strokeWidth={1} color="#008ECC" size={18} />
                                        <span>All Offers</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
