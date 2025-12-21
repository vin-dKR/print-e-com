"use client";

import Breadcrumbs from "../components/Breadcrumbs";
import BillingAddressForm from "../components/BillingAddressForm";
import ShippingMethod from "../components/ShippingMethod";
import PaymentMethod from "../components/PaymentMethod";
import CollapsibleSection from "../components/CollapsibleSection";
import BillingSummary from "../components/BillingSummary";
import CartItem from "../components/CartItem";

export default function CheckoutPage() {
  // Sample cart items - this would come from cart state/API
  const cartItems = [
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
  ];

  const shippingOptions = [
    {
      id: "usps-1st",
      name: "USPS 1st Class With Tracking",
      price: 2.99,
      description: "5 - 13 days COVID19 Delay",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      ),
    },
    {
      id: "usps-priority",
      name: "USPS PRIORITY With Tracking",
      price: 9.0,
      description: "5 - 10 days COVID19 Delay",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
  ];

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 749.99;
  const warranty = 259.99;
  const shipping = 0;
  const tax = 228.72;
  const grandTotal = subtotal - discount + warranty + shipping + tax;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Men", href: "/products?category=men" },
    { label: "T-shirts", href: "/products?category=t-shirts" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Address */}
            <BillingAddressForm
              initialData={{
                firstName: "Alex",
                lastName: "Driver",
                email: "username@gmail.com",
                state: "California",
                city: "San Diego",
                zipCode: "22434",
                phone: "+ 123 456 789 111",
              }}
            />

            {/* Shipping Method */}
            <ShippingMethod options={shippingOptions} />

            {/* Payment Method */}
            <PaymentMethod />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {/* Order Review - Collapsible */}
            <CollapsibleSection
              title="Order Review"
              subtitle={`${cartItems.length} items in cart`}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-xs text-gray-400">Img</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">
                        {item.size} • {item.color}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Discount Codes - Collapsible */}
            <CollapsibleSection title="Discount Codes" defaultExpanded={false}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Apply
                </button>
              </div>
            </CollapsibleSection>

            {/* Billing Summary - Expanded */}
            <BillingSummary
              subtotal={subtotal}
              discount={discount}
              warranty={warranty}
              shipping={shipping}
              tax={tax}
              grandTotal={grandTotal}
              itemCount={cartItems.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
