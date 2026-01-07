"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
    stock: number;
    onAddToCart: () => Promise<void>;
    onBuyNow: () => Promise<void>;
    addToCartLoading: boolean;
    buyNowLoading: boolean;
    isMobile?: boolean;
    isInCart?: boolean;
}

export default function ProductActions({
    stock,
    onAddToCart,
    onBuyNow,
    addToCartLoading,
    buyNowLoading,
    isMobile = false,
    isInCart = false,
}: ProductActionsProps) {
    const router = useRouter();
    const handleAddToCartClick = () => {
        if (isInCart) {
            router.push('/cart');
        } else {
            onAddToCart();
        }
    };

    if (isMobile) {
        return (
            <div className="flex gap-3">
                <button
                    onClick={handleAddToCartClick}
                    disabled={stock === 0 || addToCartLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                    {stock === 0 ? "Out of Stock" : addToCartLoading ? "Adding..." : isInCart ? "Go to Cart" : "Add to Cart"}
                </button>
                <button
                    onClick={onBuyNow}
                    disabled={stock === 0 || buyNowLoading}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                    {buyNowLoading ? "Processing..." : "Buy Now"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-4">
            <button
                onClick={handleAddToCartClick}
                disabled={stock === 0 || addToCartLoading}
                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
                <ShoppingBag size={20} />
                {stock === 0 ? "Out of Stock" : addToCartLoading ? "Adding..." : isInCart ? "Go to Cart" : "Add to Cart"}
            </button>
            <button
                onClick={onBuyNow}
                disabled={stock === 0 || buyNowLoading}
                className="flex-1 px-8 py-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
                {buyNowLoading ? "Processing..." : "Buy Now"}
            </button>
        </div>
    );
}

