"use client";

import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";

interface CartItemData {
  id: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([
    {
      id: "1",
      name: "Gradient Graphic T-shirt",
      image: "/products/gradient-tshirt.jpg",
      size: "Large",
      color: "White",
      price: 145,
      quantity: 1,
    },
    {
      id: "2",
      name: "Printed Mug",
      image: "/products/mug.jpg",
      size: "Medium",
      color: "Red",
      price: 180,
      quantity: 1,
    },
    {
      id: "3",
      name: "Printed Tap",
      image: "/products/tap.jpg",
      size: "Large",
      color: "Blue",
      price: 240,
      quantity: 1,
    },
  ]);

  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPercentage = 20;
  const discount = (subtotal * discountPercentage) / 100;
  const deliveryFee = 15;
  const total = subtotal - discount + deliveryFee;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">YOUR CART</h1>

            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <a
                  href="/products"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              discountPercentage={discountPercentage}
              deliveryFee={deliveryFee}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
