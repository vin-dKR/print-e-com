"use client";

import Link from "next/link";
import { use } from "react";
import ProfileSidebar from "../../components/shared/ProfileSidebar";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  customDesignUrl?: string;
}

interface OrderStatusHistory {
  status: string;
  date: string;
  description: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  statusHistory: OrderStatusHistory[];
}

// Sample order data - this would come from an API
const getOrderDetails = (id: string): OrderDetails | null => {
  const orders: { [key: string]: OrderDetails } = {
    "1": {
      id: "1",
      orderNumber: "ORD-1001",
      date: "Jan 20, 2024",
      status: "Delivered",
      total: 1299.99,
      subtotal: 1199.98,
      shipping: 50.0,
      tax: 50.01,
      discount: 0,
      items: [
        {
          id: "1",
          name: "Custom Printed T-Shirt",
          quantity: 2,
          price: 599.99,
          size: "M",
          color: "Blue",
        },
        {
          id: "2",
          name: "Logo Stamped Cap",
          quantity: 1,
          price: 299.99,
          size: "M",
          color: "Black",
        },
      ],
      shippingAddress: {
        name: "John Doe",
        phone: "+91 9876543210",
        street: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
      },
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      trackingNumber: "TRACK123456789",
      estimatedDelivery: "Jan 25, 2024",
      statusHistory: [
        {
          status: "Order Placed",
          date: "Jan 20, 2024, 10:30 AM",
          description: "Your order has been placed successfully",
        },
        {
          status: "Confirmed",
          date: "Jan 20, 2024, 11:00 AM",
          description: "Order confirmed and payment received",
        },
        {
          status: "Processing",
          date: "Jan 21, 2024, 09:00 AM",
          description: "Your order is being prepared",
        },
        {
          status: "Shipped",
          date: "Jan 22, 2024, 02:30 PM",
          description: "Your order has been shipped",
        },
        {
          status: "Delivered",
          date: "Jan 25, 2024, 04:15 PM",
          description: "Your order has been delivered",
        },
      ],
    },
    "2": {
      id: "2",
      orderNumber: "ORD-1002",
      date: "Jan 18, 2024",
      status: "Shipped",
      total: 2499.99,
      subtotal: 2499.99,
      shipping: 0,
      tax: 0,
      discount: 0,
      items: [
        {
          id: "3",
          name: "Premium Business Cards",
          quantity: 500,
          price: 1499.99,
        },
        {
          id: "4",
          name: "Custom Letterhead",
          quantity: 100,
          price: 999.99,
        },
      ],
      shippingAddress: {
        name: "John Doe",
        phone: "+91 9876543210",
        street: "456 Business Park, Floor 5",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400070",
        country: "India",
      },
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      trackingNumber: "TRACK987654321",
      estimatedDelivery: "Jan 28, 2024",
      statusHistory: [
        {
          status: "Order Placed",
          date: "Jan 18, 2024, 03:45 PM",
          description: "Your order has been placed successfully",
        },
        {
          status: "Confirmed",
          date: "Jan 18, 2024, 04:00 PM",
          description: "Order confirmed and payment received",
        },
        {
          status: "Processing",
          date: "Jan 19, 2024, 10:00 AM",
          description: "Your order is being prepared",
        },
        {
          status: "Shipped",
          date: "Jan 20, 2024, 01:30 PM",
          description: "Your order has been shipped",
        },
      ],
    },
    "3": {
      id: "3",
      orderNumber: "ORD-1003",
      date: "Jan 15, 2024",
      status: "Delivered",
      total: 899.99,
      subtotal: 899.99,
      shipping: 0,
      tax: 0,
      discount: 0,
      items: [
        {
          id: "5",
          name: "Logo Printed Mug",
          quantity: 4,
          price: 899.99,
          color: "White",
        },
      ],
      shippingAddress: {
        name: "John Doe",
        phone: "+91 9876543210",
        street: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
      },
      paymentMethod: "Debit Card",
      paymentStatus: "Paid",
      trackingNumber: "TRACK456789123",
      estimatedDelivery: "Jan 20, 2024",
      statusHistory: [
        {
          status: "Order Placed",
          date: "Jan 15, 2024, 11:20 AM",
          description: "Your order has been placed successfully",
        },
        {
          status: "Confirmed",
          date: "Jan 15, 2024, 11:30 AM",
          description: "Order confirmed and payment received",
        },
        {
          status: "Processing",
          date: "Jan 16, 2024, 09:00 AM",
          description: "Your order is being prepared",
        },
        {
          status: "Shipped",
          date: "Jan 17, 2024, 03:00 PM",
          description: "Your order has been shipped",
        },
        {
          status: "Delivered",
          date: "Jan 20, 2024, 02:00 PM",
          description: "Your order has been delivered",
        },
      ],
    },
  };

  return orders[id] || null;
};

const statusColors = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = getOrderDetails(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <ProfileSidebar />
            <main className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-gray-400 mb-4"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="text-gray-600 text-lg mb-2">Order not found</p>
                <p className="text-gray-500 text-sm mb-4">
                  The order you're looking for doesn't exist
                </p>
                <Link
                  href="/orders"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Orders
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <ProfileSidebar />

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back to Orders
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Order Details
                  </h1>
                  <p className="text-gray-600">
                    Order #{order.orderNumber} • Placed on {order.date}
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    statusColors[order.status]
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Items & Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs text-gray-400">Image</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                            {item.size && (
                              <span>Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span>Color: {item.color}</span>
                            )}
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <p className="text-base font-semibold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <Link
                            href={`/products/${item.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Product
                          </Link>
                          {order.status === "Delivered" && (
                            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                              Buy Again
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Timeline */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Status
                  </h2>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Timeline Items */}
                    <div className="space-y-6">
                      {order.statusHistory.map((historyItem, index) => {
                        const isLast = index === order.statusHistory.length - 1;
                        const isActive = isLast || order.status === historyItem.status;
                        
                        return (
                          <div key={index} className="relative flex gap-4">
                            {/* Timeline Dot */}
                            <div className="relative z-10 shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isActive
                                    ? "bg-blue-600"
                                    : "bg-gray-200"
                                }`}
                              >
                                {isActive && (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 pb-6">
                              <div
                                className={`font-medium mb-1 ${
                                  isActive
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {historyItem.status}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {historyItem.date}
                              </p>
                              <p className="text-sm text-gray-500">
                                {historyItem.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Tracking Information
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Tracking Number
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.trackingNumber}
                        </p>
                      </div>
                      {order.estimatedDelivery && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Estimated Delivery
                          </p>
                          <p className="text-base font-medium text-gray-900">
                            {order.estimatedDelivery}
                          </p>
                        </div>
                      )}
                      <button className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                        Track Package
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.shipping > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">₹{order.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">₹{order.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipping Address
                  </h2>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="text-base font-medium text-gray-900">
                        {order.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h2>
                  <div className="space-y-3">
                    {order.status === "Delivered" && (
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                        Reorder
                      </button>
                    )}
                    {order.status === "Shipped" && (
                      <Link
                        href={`/orders/${order.id}/track`}
                        className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
                      >
                        Track Order
                      </Link>
                    )}
                    {order.status === "Processing" && (
                      <button className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium">
                        Cancel Order
                      </button>
                    )}
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
                      Download Invoice
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
                      Need Help?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
