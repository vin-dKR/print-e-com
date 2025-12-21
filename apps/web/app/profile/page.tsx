"use client";

import Link from "next/link";
import ProfileSidebar from "../components/shared/ProfileSidebar";

export default function ProfilePage() {
  // Sample user data - this would come from an API
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    memberSince: "January 2024",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
              {userData.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {userData.name}
              </h1>
              <p className="text-gray-600 mb-1">{userData.email}</p>
              <p className="text-gray-600 mb-2">{userData.phone}</p>
              <p className="text-sm text-gray-500">
                Member since {userData.memberSince}
              </p>
            </div>

            {/* Edit Profile Button */}
            <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <ProfileSidebar />

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recent Orders Card */}
                <Link
                  href="/orders"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-xl font-semibold text-gray-900">12</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">View all orders →</p>
                </Link>

                {/* Saved Addresses Card */}
                <Link
                  href="/addresses"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Saved Addresses</p>
                      <p className="text-xl font-semibold text-gray-900">3</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Manage addresses →
                  </p>
                </Link>

                {/* Wishlist Card */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-pink-600"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wishlist</p>
                      <p className="text-xl font-semibold text-gray-900">8</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">View wishlist →</p>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <Link
                  href="/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {/* Sample Order Items */}
                {[1, 2, 3].map((order) => (
                  <div
                    key={order}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs text-gray-400">Image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Order #{1000 + order}
                      </p>
                      <p className="text-xs text-gray-500">
                        Placed on Jan {15 + order}, 2024
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{1200 + order * 100}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Delivered
                      </span>
                      <Link
                        href={`/orders/${1000 + order}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
