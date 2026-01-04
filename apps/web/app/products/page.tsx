"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Pagination from "../components/Pagination";
import { BarsSpinner } from "../components/shared/BarsSpinner";
import { getProducts, type Product, type ProductListParams } from "../../lib/api/products";
import { Filter, X, Grid, List } from "lucide-react";

const PRODUCTS_PER_PAGE = 20;

function ProductsPageChild() {
    const searchParams = useSearchParams();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filters
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get search query and category from URL params
    const searchQuery = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                // Build API params
                const params: ProductListParams = {
                    page: currentPage,
                    limit: PRODUCTS_PER_PAGE,
                };

                // Add search if present
                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Add category if present
                if (categoryParam) {
                    params.category = categoryParam;
                }

                // Add brand filter
                if (selectedBrands.length > 0) {
                    params.brand = selectedBrands[0]; // API supports single brand for now
                }

                // Add price range filter
                if (selectedPriceRanges.length > 0) {
                    // Parse first price range (e.g., "$0-$50" -> min: 0, max: 50)
                    const range = selectedPriceRanges[0]?.replace("$", "").split("-") || [];
                    if (range[0]) params.minPrice = parseInt(range[0] || "0");
                    if (range[1]) params.maxPrice = parseInt(range[1] || "0");
                }

                // Call API
                const response = await getProducts(params);

                if (response.success && response.data) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.pagination.totalPages);
                    setTotalProducts(response.data.pagination.total);
                } else {
                    setError(response.error || "Failed to load products");
                }
            } catch (err: any) {
                console.error("Error fetching products:", err);
                setError(err.message || "Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [
        currentPage,
        searchQuery,
        categoryParam,
        selectedBrands,
        selectedPriceRanges,
    ]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        categoryParam,
        selectedSizes,
        selectedColors,
        selectedPriceRanges,
        selectedBrands,
        selectedCollections,
        selectedTags,
    ]);

    // Close filter overlay when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const filterPanel = document.getElementById("filter-panel");
            const filterButton = document.getElementById("filter-button");

            if (isFilterOpen &&
                filterPanel &&
                !filterPanel.contains(event.target as Node) &&
                filterButton &&
                !filterButton.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isFilterOpen]);

    const handleAddToCart = (productId: string) => {
        // Handle add to cart logic (will be implemented in Phase 2)
        console.log("Add to cart:", productId);
    };

    const handleClearAllFilters = () => {
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedPriceRanges([]);
        setSelectedBrands([]);
        setSelectedCollections([]);
        setSelectedTags([]);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-20">
                        <BarsSpinner />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center py-12">
                        <div className="text-red-600 text-lg mb-4">⚠️ Error Loading Products</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-4 sm:py-8 pb-0 lg:pb-40">
            <div className="w-full px-4 md:px-40">
                {/* Mobile Header with Filter Button */}
                <div className="lg:hidden mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-serif text-gray-900">
                            {searchQuery ? 'Search' : 'Products'}
                        </h1>

                        {/* Mobile Filter Button */}
                        <button
                            id="filter-button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {(selectedSizes.length > 0 || selectedColors.length > 0 ||
                                selectedPriceRanges.length > 0 || selectedBrands.length > 0) && (
                                    <span className="ml-1 bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {selectedSizes.length + selectedColors.length +
                                            selectedPriceRanges.length + selectedBrands.length}
                                    </span>
                                )}
                        </button>
                    </div>

                    {/* Search Query Badge - Mobile */}
                    {searchQuery && (
                        <div className="flex items-center gap-3 mt-2 mb-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <span className="font-medium text-blue-900">
                                    "{searchQuery}"
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    window.location.href = '/products';
                                }}
                                className="flex items-center gap-1 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Filter Overlay */}
                {isFilterOpen && (
                    <>
                        {/* Overlay */}
                        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />

                        {/* Filter Panel */}
                        <div
                            id="filter-panel"
                            className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden shadow-xl transform transition-transform duration-300 ease-in-out"
                        >
                            <div className="h-full flex flex-col">
                                {/* Filter Header */}
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Content */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <ProductFilters
                                        selectedSizes={selectedSizes}
                                        selectedColors={selectedColors}
                                        selectedPriceRanges={selectedPriceRanges}
                                        selectedBrands={selectedBrands}
                                        selectedCollections={selectedCollections}
                                        selectedTags={selectedTags}
                                        onSizeChange={setSelectedSizes}
                                        onColorChange={setSelectedColors}
                                        onPriceRangeChange={setSelectedPriceRanges}
                                        onBrandChange={setSelectedBrands}
                                        onCollectionChange={setSelectedCollections}
                                        onTagChange={setSelectedTags}
                                    />
                                </div>

                                {/* Filter Footer */}
                                <div className="p-4 border-t">
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                        <span className="ml-2 text-sm bg-white/30 px-2 py-0.5 rounded">
                                            {selectedSizes.length + selectedColors.length +
                                                selectedPriceRanges.length + selectedBrands.length} selected
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Filters (Desktop) */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24">
                            <ProductFilters
                                selectedSizes={selectedSizes}
                                selectedColors={selectedColors}
                                selectedPriceRanges={selectedPriceRanges}
                                selectedBrands={selectedBrands}
                                selectedCollections={selectedCollections}
                                selectedTags={selectedTags}
                                onSizeChange={setSelectedSizes}
                                onColorChange={setSelectedColors}
                                onPriceRangeChange={setSelectedPriceRanges}
                                onBrandChange={setSelectedBrands}
                                onCollectionChange={setSelectedCollections}
                                onTagChange={setSelectedTags}
                            />
                        </div>
                    </aside>

                    {/* Main Content - Product Grid */}
                    <main className="flex-1">
                        {/* Desktop Header */}
                        <div className="hidden lg:block mb-6">
                            <h1 className="text-4xl font-serif text-gray-900 mb-2">
                                {searchQuery ? 'Search Results' : 'Print Your Dream'}
                            </h1>

                            {/* Search Query Badge - Desktop */}
                            {searchQuery && (
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                        <svg
                                            className="w-4 h-4 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.35-4.35"></path>
                                        </svg>
                                        <span className="text-sm font-medium text-blue-900">
                                            Searching: <span className="font-bold">"{searchQuery}"</span>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            window.location.href = '/products';
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            {/* Results Count */}
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-600">
                                    {searchQuery && totalProducts === 0 ? (
                                        <span className="text-amber-600 font-medium">No results found</span>
                                    ) : (
                                        <>
                                            Showing {products.length} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                                            {categoryParam && ` in ${categoryParam}`}
                                        </>
                                    )}
                                </p>

                                {/* Active Filters Count - Mobile */}
                                {(selectedSizes.length > 0 || selectedColors.length > 0 ||
                                    selectedPriceRanges.length > 0 || selectedBrands.length > 0) && (
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="lg:hidden text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                                        >
                                            <X size={14} />
                                            Clear filters
                                        </button>
                                    )}
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden lg:flex items-center gap-4">
                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                {/* Sort Dropdown */}
                                <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Customer Rating</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters - Desktop */}
                        {(selectedSizes.length > 0 || selectedColors.length > 0 ||
                            selectedPriceRanges.length > 0 || selectedBrands.length > 0) && (
                                <div className="hidden lg:flex flex-wrap gap-2 mb-4">
                                    {selectedSizes.map(size => (
                                        <span key={size} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                            Size: {size}
                                            <button
                                                onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))}
                                                className="ml-1 hover:text-blue-900"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedPriceRanges.map(range => (
                                        <span key={range} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                            Price: {range}
                                            <button
                                                onClick={() => setSelectedPriceRanges(prev => prev.filter(r => r !== range))}
                                                className="ml-1 hover:text-blue-900"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedBrands.map(brand => (
                                        <span key={brand} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                            Brand: {brand}
                                            <button
                                                onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))}
                                                className="ml-1 hover:text-blue-900"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {(selectedSizes.length > 0 || selectedPriceRanges.length > 0 || selectedBrands.length > 0) && (
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full border border-gray-300"
                                        >
                                            <X size={14} />
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            )}

                        {/* Product Grid/List */}
                        {products.length > 0 ? (
                            <>
                                <div className={viewMode === "grid"
                                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                    : "space-y-4"
                                }>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            id={product.id}
                                            brand={product.brand?.name || "Unknown Brand"}
                                            name={product.name}
                                            category={product.category?.name || "Unknown Category"}
                                            price={Number(product.sellingPrice || product.basePrice)}
                                            image={product.images?.[0]?.url}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            /* No Results Message */
                            <div className="text-center py-12 px-4">
                                <div className="max-w-md mx-auto">
                                    {/* Icon */}
                                    <div className="mb-6">
                                        <svg
                                            className="w-20 h-20 mx-auto text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                                            <path d="m21 21-4.35-4.35" strokeWidth="2"></path>
                                            <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2"></line>
                                            <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2"></line>
                                        </svg>
                                    </div>

                                    {searchQuery ? (
                                        <>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No results for "{searchQuery}"
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                We couldn't find any products matching your search. Try using different keywords or check out our popular products.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <button
                                                    onClick={() => {
                                                        window.location.href = '/products';
                                                    }}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    Browse All Products
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        window.location.href = '/';
                                                    }}
                                                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    Go to Homepage
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No products found
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                Try adjusting your filters to see more results.
                                            </p>
                                            <button
                                                onClick={handleClearAllFilters}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Clear All Filters
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

const ProductsPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <BarsSpinner />
            </div>
        }>
            <ProductsPageChild />
        </Suspense>
    );
};

export default ProductsPage;
