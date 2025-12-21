"use client";

import { useState, use } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import ProductImageGallery from "../../components/ProductImageGallery";
import ProductRating from "../../components/ProductRating";
import PriceDisplay from "../../components/PriceDisplay";
import UploadDesign from "../../components/UploadDesign";
import SizeSelector from "../../components/SizeSelector";
import QuantitySelector from "../../components/QuantitySelector";
import ProductTabs from "../../components/ProductTabs";
import RelatedProducts from "../../components/RelatedProducts";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);

  // Sample product data - this would come from an API
  const product = {
    id: id,
    name: "Trifold Card",
    rating: 4.5,
    reviewCount: 128,
    currentPrice: 260,
    originalPrice: 300,
    discount: 40,
    description:
      "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
    images: [
      "/products/trifold-1.jpg",
      "/products/trifold-2.jpg",
      "/products/trifold-3.jpg",
      "/products/trifold-4.jpg",
    ],
    sizes: ["Small", "Medium", "Large", "X-Large"],
    category: {
      name: "T-shirts",
      path: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
        { label: "Men", href: "/products?category=men" },
        { label: "T-shirts", href: "/products?category=t-shirts" },
      ],
    },
    details: {
      moreInfo: "451",
      variant: "Shadow Navy / Army Green",
      description:
        "This product is excluded from all promotional discounts and offers. This product is excluded from all promotional discounts and offers. This product is excluded from all promotional discounts and offers.",
      benefits: [
        "Pay over time in interest-free installments with Affirm, Klarna or Afterpay. Join adiClub to get unlimited free standard shipping, returns, & exchanges.",
        "Join adiClub to get unlimited free standard shipping, returns, & exchanges. Join adiClub to get unlimited free standard shipping, returns, &.",
      ],
    },
  };

  const relatedProducts = [
    {
      id: "1",
      name: "Polo with Contrast Trims",
      image: "/products/polo.jpg",
      rating: 4.0,
      currentPrice: 212,
      originalPrice: 242,
      discount: 20,
    },
    {
      id: "2",
      name: "Gradient Graphic T-shirt",
      image: "/products/gradient-tshirt.jpg",
      rating: 3.5,
      currentPrice: 145,
    },
    {
      id: "3",
      name: "Polo with Tipping Details",
      image: "/products/polo-tipping.jpg",
      rating: 4.5,
      currentPrice: 180,
    },
    {
      id: "4",
      name: "Black Striped T-shirt",
      image: "/products/striped-tshirt.jpg",
      rating: 5.0,
      currentPrice: 120,
      originalPrice: 150,
      discount: 30,
    },
  ];

  const handleAddToCart = () => {
    // Handle add to cart logic
    console.log("Add to cart:", {
      productId: product.id,
      size: selectedSize,
      quantity,
    });
  };

  const tabs = [
    {
      id: "details",
      label: "Product Details",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              More Info ({product.details.moreInfo})
            </h3>
            <p className="text-gray-600 mb-2">{product.details.variant}</p>
            <p className="text-gray-600">{product.details.description}</p>
          </div>
          <div>
            <ul className="space-y-2 text-gray-600">
              {product.details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "reviews",
      label: "Rating & Reviews",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Latest</option>
                <option>Oldest</option>
                <option>Highest Rating</option>
                <option>Lowest Rating</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Write a Review
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        </div>
      ),
    },
    {
      id: "faqs",
      label: "FAQs",
      content: (
        <div className="space-y-4">
          <div className="text-center py-12 text-gray-500">
            <p>No FAQs available for this product yet.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={product.category.path} />

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Product Images */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} />

            {/* Price */}
            <PriceDisplay
              currentPrice={product.currentPrice}
              originalPrice={product.originalPrice}
              discount={product.discount}
            />

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Upload Design */}
            <UploadDesign />

            {/* Size Selector */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-6 pt-4">
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              <button
                onClick={handleAddToCart}
                className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs tabs={tabs} />

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
