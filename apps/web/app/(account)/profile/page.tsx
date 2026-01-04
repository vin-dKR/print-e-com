"use client";

import Link from "next/link";
import ProfileSidebar from "@/app/components/shared/ProfileSidebar";
import { Package, MapPin, Heart, Calendar, Phone, Mail, Edit2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { get } from "@/lib/api-client";
import { BarsSpinner } from "@/app/components/shared/BarsSpinner";

interface UserDataType {
    id: string
    email: string
    name: string
    phone: string
    isAdmin: boolean
    addresses: []
    createdAt: string
}

interface ErrorType {
    success: boolean
    error: string
}

function ProfilePageContent() {
    const [userData, setUserData] = useState<UserDataType | null>(null)
    const [error, setError] = useState<ErrorType | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await get<UserDataType>("/auth/user/profile")

                if (response.success && response.data) {
                    setUserData(response.data)
                    setError(null)
                } else {
                    setError({
                        success: false,
                        error: response.error || 'Failed to fetch user data'
                    })
                    setUserData(null)
                }
            } catch (err) {
                setError({
                    success: false,
                    error: err instanceof Error ? err.message : 'An unknown error occurred'
                })
                setUserData(null)
            }
        }

        fetchUserData()
    }, [])

    const stats = [
        { label: "Total Orders", value: "12", icon: Package, href: "/orders", color: "blue" },
        { label: "Saved Addresses", value: "3", icon: MapPin, href: "/addresses", color: "green" },
        { label: "Wishlist Items", value: "8", icon: Heart, href: "/wishlist", color: "pink" },
    ];

    const recentOrders = [
        { id: "ORD-1001", date: "Jan 25, 2024", amount: "₹1,299.99", status: "Delivered" },
        { id: "ORD-1002", date: "Jan 22, 2024", amount: "₹2,499.99", status: "Shipped" },
        { id: "ORD-1003", date: "Jan 18, 2024", amount: "₹899.99", status: "Delivered" },
    ];

    if (userData === null) {
        return (
            <div className="h-180 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Loading State */}
                    {error === null ? (
                        <BarsSpinner />
                    ) : (
                        /* Error State */
                        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.884-.833-2.654 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                {error.success === false ? 'Error' : 'Something went wrong'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {error.error || 'Unable to load user profile. Please try again.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 pb-10 lg:pb-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        {/* Profile Picture */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#008ECC] to-blue-400 flex items-center justify-center text-white text-2xl sm:text-3xl font-hkgb">
                            {userData.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-hkgb text-gray-900 mb-2 sm:mb-3">
                                {userData.name}
                            </h1>

                            <div className="space-y-2 sm:space-y-3">
                                {/* Email */}
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm sm:text-base text-gray-600 truncate">{userData.email}</p>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm sm:text-base text-gray-600">{userData.phone}</p>
                                </div>

                                {/* Member Since */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        Member since {userData.createdAt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border border-[#008ECC] text-[#008ECC] rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Overview Cards */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-hkgb text-gray-900 mb-4 sm:mb-6">
                                Account Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                {stats.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Link
                                            key={stat.label}
                                            href={stat.href}
                                            className="group p-3 sm:p-4 border border-gray-100 rounded-xl hover:border-[#008ECC] hover:shadow-sm transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 mb-2 sm:mb-3">
                                                <div className={`w-10 h-10 rounded-full bg-${stat.color}-100 flex items-center justify-center group-hover:bg-${stat.color}-50 transition-colors`}>
                                                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                                    <p className="text-xl font-hkgb text-gray-900">{stat.value}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 group-hover:text-[#008ECC] transition-colors">
                                                View details →
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Recent Orders
                                </h2>
                                <Link
                                    href="/orders"
                                    className="text-sm text-[#008ECC] hover:text-[#0077B3] font-medium flex items-center gap-1"
                                >
                                    View All
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-300 group"
                                    >
                                        {/* Order Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Package className="w-5 h-5 text-gray-400" />
                                                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                                    {order.id}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <p className="text-gray-600">Placed on {order.date}</p>
                                                <span className="hidden sm:block text-gray-300">•</span>
                                                <p className="font-hkgb text-gray-900">{order.amount}</p>
                                            </div>
                                        </div>

                                        {/* Status & Action */}
                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="text-sm text-[#008ECC] hover:text-[#0077B3] font-medium whitespace-nowrap"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/products"
                                        className="flex-1 px-4 py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm text-center"
                                    >
                                        Continue Shopping
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-center"
                                    >
                                        View All Orders
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Section (Desktop only) */}
                        <div className="hidden sm:grid sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                            {/* Account Security */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <h3 className="text-lg font-hkgb text-gray-900 mb-3">Account Security</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Password</span>
                                        <button className="text-sm text-[#008ECC] hover:text-[#0077B3] font-medium">
                                            Change
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Two-Factor Auth</span>
                                        <button className="text-sm text-[#008ECC] hover:text-[#0077B3] font-medium">
                                            Enable
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <h3 className="text-lg font-hkgb text-gray-900 mb-3">Preferences</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Email Notifications</span>
                                        <div className="w-10 h-6 bg-[#008ECC] rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">SMS Notifications</span>
                                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
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

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePageContent />
        </ProtectedRoute>
    );
}
