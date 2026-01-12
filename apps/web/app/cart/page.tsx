"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../components/Breadcrumbs";
import CartItem from "../components/CartItem";
import BillingSummary from "../components/BillingSummary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";
import { BarsSpinner } from "@/app/components/shared/BarsSpinner";
import { toastError, toastWarning } from "@/lib/utils/toast";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

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

    const { confirm, ConfirmDialog } = useConfirm();
    const router = useRouter();

    // Selection state - track which items are selected
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Select all items by default on mount
    useEffect(() => {
        if (items.length > 0 && selectedItems.size === 0) {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    }, [items, selectedItems.size]);

    // Filter selected items
    const selectedItemsList = useMemo(() => {
        return items.filter(item => selectedItems.has(item.id));
    }, [items, selectedItems]);

    // Calculate MRP (Maximum Retail Price) for selected items only
    const mrp = useMemo(() => {
        return selectedItemsList.reduce((sum, item) => {
            const product = item.product as any;
            const mrpPrice = Number(product?.mrp || 0);
            return sum + mrpPrice * item.quantity;
        }, 0);
    }, [selectedItemsList]);

    // Calculate subtotal (selling price) for selected items only
    const subtotal = useMemo(() => {
        return selectedItemsList.reduce((sum, item) => {
            const price = Number(item.product?.sellingPrice || item.product?.basePrice || 0);
            const variantModifier = Number(item.variant?.priceModifier || 0);
            const itemPrice = price + variantModifier;
            return sum + itemPrice * item.quantity;
        }, 0);
    }, [selectedItemsList]);

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
            toastError('Failed to update cart item. Please try again.');
        }
    };

    const handleRemoveItem = async (id: string) => {
        const confirmed = await confirm({
            title: 'Remove Item',
            description: 'Are you sure you want to remove this item from your cart?',
            confirmText: 'Remove',
            cancelText: 'Cancel',
            variant: 'destructive',
            onConfirm: async () => {
                const success = await removeItem(id);
                if (!success) {
                    toastError('Failed to remove item from cart. Please try again.');
                } else {
                    // Remove from selection if it was selected
                    setSelectedItems(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                }
            },
        });
    };

    const handleSelectChange = (id: string, selected: boolean) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (selected) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.size === items.length) {
            // Deselect all
            setSelectedItems(new Set());
        } else {
            // Select all
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    };

    const handleGoToCheckout = () => {
        if (selectedItems.size === 0) {
            toastWarning('Please select at least one item to checkout.');
            return;
        }

        // Pass selected item IDs as URL params
        const selectedIds = Array.from(selectedItems).join(',');
        router.push(`/checkout?items=${selectedIds}`);
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Cart", href: "/cart" },
    ];

    return (
        <div className="min-h-screen py-8">
            {ConfirmDialog}
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
                            {/* Select All / Deselect All */}
                            {items.length > 0 && (
                                <div className="mb-4 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.size === items.length && items.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Select All ({selectedItems.size} of {items.length} selected)
                                        </span>
                                    </label>
                                </div>
                            )}

                            {items.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-50 flex items-center justify-center">
                                        <ShoppingCart className="text-gray-400 w-8 h-8" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</p>
                                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                                        Looks like you haven't added anything to your cart yet. Start shopping to add items.
                                    </p>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-[#008ECC] active:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow font-medium"
                                    >
                                        Continue Shopping
                                    </Link>
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
                                            isSelected={selectedItems.has(item.id)}
                                            onSelectChange={handleSelectChange}
                                            showCheckbox={true}
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
                                    itemCount={selectedItemsList.length}
                                    showCheckoutActions={false}
                                />
                                <button
                                    onClick={handleGoToCheckout}
                                    disabled={selectedItems.size === 0}
                                    className={`w-full mt-4 px-6 py-3 rounded-lg text-white transition-colors font-medium ${selectedItems.size > 0
                                        ? "bg-[#1EADD8] hover:bg-blue-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Go to Checkout ({selectedItemsList.length} {selectedItemsList.length === 1 ? 'item' : 'items'})
                                </button>
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
