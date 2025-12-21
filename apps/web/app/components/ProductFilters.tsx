"use client";

import { useState } from "react";

interface ProductFiltersProps {
  selectedSizes: string[];
  selectedColors: string[];
  selectedPriceRanges: string[];
  selectedBrands: string[];
  selectedCollections: string[];
  selectedTags: string[];
  onSizeChange: (sizes: string[]) => void;
  onColorChange: (colors: string[]) => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onBrandChange: (brands: string[]) => void;
  onCollectionChange: (collections: string[]) => void;
  onTagChange: (tags: string[]) => void;
}

const sizes = ["S", "M", "L", "XL"];
const colors = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Light Green", value: "#84CC16" },
  { name: "Dark Green", value: "#22C55E" },
  { name: "Light Blue", value: "#3B82F6" },
  { name: "Dark Blue", value: "#1E40AF" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Coral", value: "#F87171" },
];
const priceRanges = [
  "$0-$50",
  "$50-$100",
  "$100-$150",
  "$150-$200",
  "$300-$400",
];
const brands = ["Minimog", "Retrolie Brook", "Learts", "Vagabond", "Abby"];
const collections = [
  "All products",
  "Best sellers",
  "New arrivals",
  "Accessories",
];
const tags = [
  "Fashion",
  "Hats",
  "Sandal",
  "Belt",
  "Bags",
  "Snacker",
  "Denim",
  "Minimog",
  "Vagabond",
  "Sunglasses",
  "Beachwear",
];

export default function ProductFilters({
  selectedSizes,
  selectedColors,
  selectedPriceRanges,
  selectedBrands,
  selectedCollections,
  selectedTags,
  onSizeChange,
  onColorChange,
  onPriceRangeChange,
  onBrandChange,
  onCollectionChange,
  onTagChange,
}: ProductFiltersProps) {
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter((s) => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const togglePriceRange = (range: string) => {
    if (selectedPriceRanges.includes(range)) {
      onPriceRangeChange(selectedPriceRanges.filter((r) => r !== range));
    } else {
      onPriceRangeChange([...selectedPriceRanges, range]);
    }
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const toggleCollection = (collection: string) => {
    if (selectedCollections.includes(collection)) {
      onCollectionChange(selectedCollections.filter((c) => c !== collection));
    } else {
      onCollectionChange([...selectedCollections, collection]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="w-full lg:w-64 space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Filters</h2>

      {/* Size Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedSizes.includes(size)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Colors</h3>
        <div className="grid grid-cols-6 gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? "border-gray-900 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Prices Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Prices</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(range)}
                onChange={() => togglePriceRange(range)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {range}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <button
          onClick={() => setIsBrandsOpen(!isBrandsOpen)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="text-sm font-semibold text-gray-900">Brands</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${
              isBrandsOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isBrandsOpen && (
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Collections Filter */}
      <div>
        <button
          onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${
              isCollectionsOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isCollectionsOpen && (
          <div className="space-y-2">
            {collections.map((collection) => (
              <label
                key={collection}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection)}
                  onChange={() => toggleCollection(collection)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {collection}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
