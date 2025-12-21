"use client";

import Link from "next/link";
import { useState } from "react";
import ProfileSidebar from "../components/shared/ProfileSidebar";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
}

// Sample orders data - this would come from an API
const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-1001",
    date: "Jan 20, 2024",
    status: "Delivered",
    total: 1299.99,
    items: [
      { name: "Custom Printed T-Shirt", quantity: 2, price: 599.99 },
      { name: "Logo Stamped Cap", quantity: 1, price: 299.99 },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-1002",
    date: "Jan 18, 2024",
    status: "Shipped",
    total: 2499.99,
    items: [
      { name: "Premium Business Cards", quantity: 500, price: 1499.99 },
      { name: "Custom Letterhead", quantity: 100, price: 999.99 },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-1003",
    date: "Jan 15, 2024",
    status: "Delivered",
    total: 899.99,
    items: [{ name: "Logo Printed Mug", quantity: 4, price: 899.99 }],
  },
  {
    id: "4",
    orderNumber: "ORD-1004",
    date: "Jan 12, 2024",
    status: "Processing",
    total: 1799.99,
    items: [
      { name: "Custom Backpack", quantity: 1, price: 1799.99 },
    ],
  },
  {
    id: "5",
    orderNumber: "ORD-1005",
    date: "Jan 10, 2024",
    status: "Cancelled",
    total: 599.99,
    items: [{ name: "Printed Stickers", quantity: 100, price: 599.99 }],
  },
];

const statusColors = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">
                View and track all your orders in one place
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "Delivered", "Shipped", "Processing", "Cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "All Orders" : status}
                </button>
              )
            )}
          </div>
        </div>

            {/* Orders List */}
            <div className="space-y-4">
          {filteredOrders.length === 0 ? (
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p className="text-gray-600 text-lg mb-2">No orders found</p>
              <p className="text-gray-500 text-sm">
                {filterStatus === "all"
                  ? "You haven't placed any orders yet"
                  : `No ${filterStatus.toLowerCase()} orders`}
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs text-gray-400">Image</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                  {order.status === "Delivered" && (
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                      Reorder
                    </button>
                  )}
                  {order.status === "Shipped" && (
                    <Link
                      href={`/orders/${order.id}/track`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Track Order
                    </Link>
                  )}
                  {order.status === "Processing" && (
                    <button className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
