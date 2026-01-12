"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarsSpinner } from "../shared/BarsSpinner";

interface ProductActionsProps {
    stock: number;
    onAddToCart: () => Promise<void>;
    onBuyNow: () => Promise<void>;
    addToCartLoading: boolean;
    buyNowLoading: boolean;
    isMobile?: boolean;
    isInCart?: boolean;
    hasFiles?: boolean; // Whether files have been uploaded
}

export default function ProductActions({
    stock,
    onAddToCart,
    onBuyNow,
    addToCartLoading,
    buyNowLoading,
    isMobile = false,
    isInCart = false,
    hasFiles = false,
}: ProductActionsProps) {
    const router = useRouter();
    const handleAddToCartClick = () => {
        if (isInCart) {
            router.push('/cart');
        } else {
            onAddToCart();
        }
    };

    // Disable buttons if no files uploaded
    const isDisabled = stock === 0 || !hasFiles;
    const addToCartDisabled = isDisabled || addToCartLoading || (isInCart ? false : !hasFiles);
    const buyNowDisabled = isDisabled || buyNowLoading || !hasFiles;

    if (isMobile) {
        return (
            <div className="flex gap-3 w-full">
                <button
                    onClick={handleAddToCartClick}
                    disabled={addToCartDisabled}
                    className="flex-1 px-4 py-3 bg-[#008ECC] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                    {addToCartLoading && <BarsSpinner size={16} />}
                    {stock === 0 ? "Out of Stock" : !hasFiles ? "Upload File First" : addToCartLoading ? "Adding..." : isInCart ? "Go to Cart" : "Add to Cart"}
                </button>
                <button
                    onClick={onBuyNow}
                    disabled={buyNowDisabled}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                    {buyNowLoading && <BarsSpinner size={16} />}
                    {!hasFiles ? "Upload File First" : buyNowLoading ? "Processing..." : "Buy Now"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-4">
            <button
                onClick={handleAddToCartClick}
                disabled={addToCartDisabled}
                className="flex-1 px-8 py-4 bg-[#008ECC] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
                {addToCartLoading ? <BarsSpinner size={20} /> : <ShoppingBag size={20} />}
                {stock === 0 ? "Out of Stock" : !hasFiles ? "Upload File First" : addToCartLoading ? "Adding..." : isInCart ? "Go to Cart" : "Add to Cart"}
            </button>
            <button
                onClick={onBuyNow}
                disabled={buyNowDisabled}
                className="flex-1 px-8 py-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
                {buyNowLoading && <BarsSpinner size={20} />}
                {!hasFiles ? "Upload File First" : buyNowLoading ? "Processing..." : "Buy Now"}
            </button>
        </div>
    );
}

