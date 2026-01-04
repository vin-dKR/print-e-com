/**
 * useCart Hook
 * Manages cart data and operations with optimistic updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  type Cart,
  type CartItem,
  type CartResponse,
  type UpdateCartItemData,
} from '@/lib/api/cart';

export interface UseCartReturn {
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  error: string | null;
  updatingItemId: string | null;
  removingItemId: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  refetch: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCartItems: () => Promise<boolean>;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Fetch cart data (with optional loading state control)
  const fetchCart = useCallback(async (setLoadingState = true) => {
    try {
      if (setLoadingState) {
        setLoading(true);
      }
      setError(null);
      const response = await getCart();

      if (response.success && response.data) {
        // The API returns { cart, subtotal, itemCount }
        const cartResponse = response.data as CartResponse;
        setCart(cartResponse.cart);
      } else {
        setError(response.error || 'Failed to fetch cart');
        setCart(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCart(null);
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCart(true);
  }, [fetchCart]);

  // Update cart item quantity (optimistic update)
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    if (quantity < 1 || !cart) {
      return false;
    }

    // Store previous state for rollback
    const previousCart = cart;

    // Optimistic update: update local state immediately
    setCart((prevCart) => {
      if (!prevCart) return null;
      return {
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    });

    try {
      setUpdatingItemId(itemId);
      const response = await updateCartItem(itemId, { quantity });

      if (response.success) {
        // Success - state is already updated, no need to refetch
        setUpdatingItemId(null);
        return true;
      } else {
        // Error - rollback to previous state
        setCart(previousCart);
        setError(response.error || 'Failed to update cart item');
        setUpdatingItemId(null);
        return false;
      }
    } catch (err) {
      // Error - rollback to previous state
      setCart(previousCart);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      setUpdatingItemId(null);
      return false;
    }
  }, [cart]);

  // Remove cart item (optimistic update)
  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!cart) {
      return false;
    }

    // Store previous state for rollback
    const previousCart = cart;

    // Optimistic update: remove item from local state immediately
    setCart((prevCart) => {
      if (!prevCart) return null;
      return {
        ...prevCart,
        items: prevCart.items.filter((item) => item.id !== itemId),
      };
    });

    try {
      setRemovingItemId(itemId);
      const response = await removeFromCart(itemId);

      if (response.success) {
        // Success - state is already updated, no need to refetch
        setRemovingItemId(null);
        return true;
      } else {
        // Error - rollback to previous state
        setCart(previousCart);
        setError(response.error || 'Failed to remove cart item');
        setRemovingItemId(null);
        return false;
      }
    } catch (err) {
      // Error - rollback to previous state
      setCart(previousCart);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove cart item';
      setError(errorMessage);
      setRemovingItemId(null);
      return false;
    }
  }, [cart]);

  // Clear entire cart
  const clearCartItems = useCallback(async (): Promise<boolean> => {
    try {
      const response = await clearCart();

      if (response.success) {
        setCart(null);
        return true;
      } else {
        setError(response.error || 'Failed to clear cart');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Computed values
  const items = useMemo(() => {
    return cart?.items || [];
  }, [cart]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product?.sellingPrice || item.product?.basePrice || 0;
      const variantModifier = item.variant?.priceModifier || 0;
      const itemPrice = Number(price) + Number(variantModifier);
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    // Fixed delivery fee for now, can be calculated based on subtotal or location
    return 15;
  }, []);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  return {
    cart,
    items,
    loading,
    error,
    updatingItemId,
    removingItemId,
    subtotal,
    deliveryFee,
    total,
    itemCount,
    refetch: () => fetchCart(true),
    updateQuantity,
    removeItem,
    clearCartItems,
  };
}
