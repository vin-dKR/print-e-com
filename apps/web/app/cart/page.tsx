"use client";

import { useMemo } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import CartItem from "../components/CartItem";
import BillingSummary from "../components/BillingSummary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";
import { BarsSpinner } from "@/app/components/shared/BarsSpinner";

function CartPageContent() {
    const {
        cart,
        items,
        loading,
        error,
        updatingItemId,
        removingItemId,
        total,
        updateQuantity,
        removeItem,
        refetch,
    } = useCart();

    // Calculate MRP (Maximum Retail Price) for cart items
    const mrp = useMemo(() => {
        return items.reduce((sum, item) => {
            const product = item.product as any;
            const mrpPrice = Number(product?.mrp || 0);
            return sum + mrpPrice * item.quantity;
        }, 0);
    }, [items]);

    // Calculate subtotal (selling price) for cart items
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = Number(item.product?.sellingPrice || item.product?.basePrice || 0);
            const variantModifier = Number(item.variant?.priceModifier || 0);
            const itemPrice = price + variantModifier;
            return sum + itemPrice * item.quantity;
        }, 0);
    }, [items]);

    // Cart-level billing values (no extra discount/coupon on cart page)
    const discount = 0;
    const couponApplied = 0;
    const shippingFee = 15; // Same as checkout for now

    const tax = useMemo(() => {
        const taxableAmount = subtotal || 0;
        return taxableAmount * 0.18;
    }, [subtotal]);

    const grandTotal = useMemo(() => {
        return (subtotal || 0) + shippingFee + tax;
    }, [subtotal, shippingFee, tax]);


    const handleQuantityChange = async (id: string, quantity: number) => {
        if (quantity < 1) {
            return;
        }
        const success = await updateQuantity(id, quantity);
        if (!success) {
            alert('Failed to update cart item. Please try again.');
        }
    };

    const handleRemoveItem = async (id: string) => {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }
        const success = await removeItem(id);
        if (!success) {
            alert('Failed to remove item from cart. Please try again.');
        }
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Cart", href: "/cart" },
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbs} />

                <h1 className="text-3xl font-hkgb font-bold text-gray-900 mb-6">YOUR CART</h1>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <BarsSpinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-2">
                            {items.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                                    <a
                                        href="/products"
                                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                    >
                                        Continue Shopping
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4 border border-gray-100 rounded-2xl p-4 pb-0">
                                    {items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onQuantityChange={handleQuantityChange}
                                            onRemove={handleRemoveItem}
                                            isUpdating={updatingItemId === item.id}
                                            isRemoving={removingItemId === item.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Billing Summary */}
                        {items.length > 0 && (
                            <div className="lg:col-span-1">
                                <BillingSummary
                                    mrp={mrp || 0}
                                    subtotal={subtotal || 0}
                                    discount={discount}
                                    couponApplied={couponApplied}
                                    shipping={shippingFee}
                                    tax={tax}
                                    grandTotal={grandTotal}
                                    itemCount={items.length}
                                    showCheckoutActions={false}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <ProtectedRoute>
            <CartPageContent />
        </ProtectedRoute>
    );
}
