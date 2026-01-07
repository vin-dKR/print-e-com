/**
 * useCheckout Hook
 * Manages checkout data and operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAddresses } from '@/hooks/addresses/useAddresses';
import { validateCoupon, getAvailableCoupons, type Coupon, type ValidateCouponResponse } from '@/lib/api/coupons';
import { Address } from '@/lib/api/addresses';

export interface UseCheckoutReturn {
    // Cart data
    cartItems: any[];
    mrp: number;
    subtotal: number;
    deliveryFee: number;
    itemCount: number;

    // Address data
    addresses: Address[];
    defaultAddress: Address | null;
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string | null) => void;
    addressLoading: boolean;
    addressError: string | null;

    // Coupon data
    availableCoupons: Coupon[];
    appliedCoupon: ValidateCouponResponse | null;
    couponCode: string;
    setCouponCode: (code: string) => void;
    discountAmount: number;
    isApplyingCoupon: boolean;
    couponError: string | null;
    applyCoupon: () => Promise<boolean>;
    removeCoupon: () => void;

    // Calculated totals
    tax: number;
    grandTotal: number;

    // Loading states
    loading: boolean;
    error: string | null;
}

export function useCheckout(): UseCheckoutReturn {
    // Cart hook
    const {
        items: cartItems,
        total,
        itemCount,
        loading: cartLoading,
        error: cartError,
    } = useCart();

    // Fixed delivery fee (can be calculated based on subtotal or location)
    const deliveryFee = 15;

    // Calculate MRP (Maximum Retail Price) - sum of all MRP prices
    const mrp = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            // Type assertion to access mrp if it exists in the product
            const product = item.product as any;
            const mrpPrice = Number(product?.mrp || 0);
            return sum + mrpPrice * item.quantity;
        }, 0);
    }, [cartItems]);

    // Calculate subtotal (selling price) - sum of all selling prices
    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = Number(item.product?.sellingPrice || item.product?.basePrice || 0);
            const variantModifier = Number(item.variant?.priceModifier || 0);
            const itemPrice = price + variantModifier;
            return sum + itemPrice * item.quantity;
        }, 0);
    }, [cartItems]);

    // Addresses hook
    const {
        addresses,
        loading: addressLoading,
        error: addressError,
    } = useAddresses();

    // Coupon state
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Address selection
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Find default address
    const defaultAddress = useMemo(() => {
        return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
    }, [addresses]);

    // Set selected address to default on mount
    useEffect(() => {
        if (defaultAddress && !selectedAddressId) {
            setSelectedAddressId(defaultAddress.id);
        }
    }, [defaultAddress, selectedAddressId]);

    // Fetch available coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await getAvailableCoupons();
                if (response.success && response.data) {
                    setAvailableCoupons(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch coupons:', err);
            }
        };
        fetchCoupons();
    }, []);

    // Apply coupon
    const applyCoupon = useCallback(async (): Promise<boolean> => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return false;
        }

        setIsApplyingCoupon(true);
        setCouponError(null);

        try {
            const response = await validateCoupon({
                code: couponCode.trim().toUpperCase(),
                orderAmount: subtotal || 0,
            });

            if (response.success && response.data) {
                setAppliedCoupon(response.data);
                setCouponError(null);
                return true;
            } else {
                setCouponError(response.error || 'Invalid coupon code');
                setAppliedCoupon(null);
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to apply coupon';
            setCouponError(errorMessage);
            setAppliedCoupon(null);
            return false;
        } finally {
            setIsApplyingCoupon(false);
        }
    }, [couponCode, subtotal]);

    // Remove coupon
    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError(null);
    }, []);

    // Calculate discount amount
    const discountAmount = useMemo(() => {
        return appliedCoupon?.discountAmount || 0;
    }, [appliedCoupon]);

    // Calculate tax (18% GST for now)
    const tax = useMemo(() => {
        const taxableAmount = (subtotal || 0) - discountAmount;
        return taxableAmount * 0.18;
    }, [subtotal, discountAmount]);

    // Calculate grand total
    const grandTotal = useMemo(() => {
        return (subtotal || 0) - discountAmount + (deliveryFee || 0) + tax;
    }, [subtotal, discountAmount, deliveryFee, tax]);

    // Combined loading state
    const loading = cartLoading || addressLoading;

    // Combined error state
    const error = cartError || addressError;

    return {
        // Cart data
        cartItems,
        mrp,
        subtotal,
        deliveryFee,
        itemCount,

        // Address data
        addresses,
        defaultAddress,
        selectedAddressId,
        setSelectedAddressId,
        addressLoading,
        addressError,

        // Coupon data
        availableCoupons,
        appliedCoupon,
        couponCode,
        setCouponCode,
        discountAmount,
        isApplyingCoupon,
        couponError,
        applyCoupon,
        removeCoupon,

        // Calculated totals
        tax,
        grandTotal,

        // Loading states
        loading,
        error,
    };
}

