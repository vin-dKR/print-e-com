"use client";

import Link from "next/link";
import { use } from "react";
import {
    Package,
    Truck,
    CreditCard,
    MapPin,
    Download,
    HelpCircle,
    ArrowLeft,
    Check,
    Printer,
} from "lucide-react";

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

// Sample order data
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
    };

    return orders[id] || null;
};

const statusColors = {
    Delivered: "bg-green-100 text-green-700 border border-green-200",
    Shipped: "bg-blue-100 text-blue-700 border border-blue-200",
    Processing: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Cancelled: "bg-red-100 text-red-700 border border-red-200",
};

function OrderDetailsPageContent({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const order = getOrderDetails(id);

    if (!order) {
        return (
            <>
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Package className="text-gray-400 w-8 h-8" />
                        </div>
                        <p className="text-lg font-hkgb text-gray-900 mb-2">
                            Order not found
                        </p>
                        <p className="text-gray-600 text-sm mb-6">
                            The order you're looking for doesn't exist or has
                            been removed
                        </p>
                        <Link
                            href="/orders"
                            className="inline-block px-6 py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-hkgb text-sm"
                        >
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 text-[#008ECC] hover:text-[#0077B3] mb-4 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-hkgb text-gray-900 mb-2">
                                Order Details
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Order #{order.orderNumber} • Placed on{" "}
                                {order.date}
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

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Order Items & Timeline */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-hkgb text-gray-900 mb-4">
                                Order Items ({order.items.length})
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-300"
                                    >
                                        {/* Product Image */}
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Package className="text-gray-400 w-6 h-6 sm:w-8 sm:h-8" />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 truncate">
                                                {item.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                                                {item.size && (
                                                    <span className="bg-gray-50 px-2 py-1 rounded">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span className="bg-gray-50 px-2 py-1 rounded">
                                                        Color: {item.color}
                                                    </span>
                                                )}
                                                <span className="bg-gray-50 px-2 py-1 rounded">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm sm:text-base font-hkgb text-gray-900">
                                                    ₹{item.price.toFixed(2)}
                                                </p>
                                                <Link
                                                    href={`/products/${item.id}`}
                                                    className="text-xs sm:text-sm text-[#008ECC] hover:text-[#0077B3] font-medium"
                                                >
                                                    View Product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Status Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-hkgb text-gray-900 mb-4">
                                Order Status Timeline
                            </h2>
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                {/* Timeline Items */}
                                <div className="space-y-6">
                                    {order.statusHistory.map(
                                        (historyItem, index) => {
                                            const isLast =
                                                index ===
                                                order.statusHistory.length - 1;
                                            const isActive =
                                                isLast ||
                                                order.status ===
                                                    historyItem.status;

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative flex gap-3 sm:gap-4"
                                                >
                                                    {/* Timeline Dot */}
                                                    <div className="relative z-10 shrink-0">
                                                        <div
                                                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                                                isActive
                                                                    ? "bg-[#008ECC]"
                                                                    : "bg-gray-200"
                                                            }`}
                                                        >
                                                            {isActive && (
                                                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Timeline Content */}
                                                    <div className="flex-1 pb-6">
                                                        <div
                                                            className={`font-medium mb-1 text-sm sm:text-base ${
                                                                isActive
                                                                    ? "text-gray-900 font-hkgb"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {historyItem.status}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                                            {historyItem.date}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            {
                                                                historyItem.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tracking Information */}
                        {order.trackingNumber && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck className="text-[#008ECC] w-5 h-5 sm:w-6 sm:h-6" />
                                    <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                        Tracking Information
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Tracking Number
                                        </p>
                                        <p className="text-base font-hkgb text-gray-900">
                                            {order.trackingNumber}
                                        </p>
                                    </div>
                                    {order.estimatedDelivery && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Estimated Delivery
                                            </p>
                                            <p className="text-base font-hkgb text-gray-900">
                                                {order.estimatedDelivery}
                                            </p>
                                        </div>
                                    )}
                                    <button className="mt-3 px-4 py-2.5 border border-[#008ECC] text-[#008ECC] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                                        Track Package
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary & Details */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-hkgb text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                        ₹{order.subtotal.toFixed(2)}
                                    </span>
                                </div>
                                {order.shipping > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Shipping
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                            ₹{order.shipping.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Tax
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                            ₹{order.tax.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span className="font-medium">
                                            -₹{order.discount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-hkgb text-gray-900">
                                            Total Amount
                                        </span>
                                        <span className="text-lg sm:text-xl font-hkgb text-[#008ECC]">
                                            ₹{order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-[#008ECC] w-5 h-5 sm:w-6 sm:h-6" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Shipping Address
                                </h2>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                                <p className="font-hkgb text-gray-900">
                                    {order.shippingAddress.name}
                                </p>
                                <p className="text-gray-600">
                                    {order.shippingAddress.phone}
                                </p>
                                <p className="mt-2 text-gray-900">
                                    {order.shippingAddress.street}
                                </p>
                                <p className="text-gray-600">
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zipCode}
                                </p>
                                <p className="text-gray-600">
                                    {order.shippingAddress.country}
                                </p>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="text-[#008ECC] w-5 h-5 sm:w-6 sm:h-6" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Payment Information
                                </h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Payment Method
                                    </p>
                                    <p className="text-base font-hkgb text-gray-900">
                                        {order.paymentMethod}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Payment Status
                                    </p>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-200">
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-hkgb text-gray-900 mb-4">
                                Order Actions
                            </h2>
                            <div className="space-y-3">
                                {/* Primary Actions */}
                                {order.status === "Delivered" && (
                                    <button className="w-full px-4 py-2.5 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm">
                                        Reorder All Items
                                    </button>
                                )}
                                {order.status === "Shipped" && (
                                    <button className="w-full px-4 py-2.5 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm">
                                        Track Order
                                    </button>
                                )}
                                {order.status === "Processing" && (
                                    <button className="w-full px-4 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm">
                                        Cancel Order
                                    </button>
                                )}

                                {/* Secondary Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                        <Download className="w-4 h-4" />
                                        Invoice
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                </div>

                                {/* Tertiary Actions */}
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                    <HelpCircle className="w-4 h-4" />
                                    Need Help?
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <OrderDetailsPageContent params={params} />;
}
