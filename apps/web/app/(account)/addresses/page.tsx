"use client";

import { useState } from "react";
import ProfileSidebar from "@/app/components/shared/ProfileSidebar";
import { MapPin, Home, Briefcase, Map, Plus, Edit2, Trash2, Check, X, Phone, User, Building } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Address {
    id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    type: "Home" | "Work" | "Other";
}

// Sample addresses data
const initialAddresses: Address[] = [
    {
        id: "1",
        name: "John Doe",
        phone: "+91 9876543210",
        street: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
        isDefault: true,
        type: "Home",
    },
    {
        id: "2",
        name: "John Doe",
        phone: "+91 9876543210",
        street: "456 Business Park, Floor 5",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400070",
        country: "India",
        isDefault: false,
        type: "Work",
    },
    {
        id: "3",
        name: "John Doe",
        phone: "+91 9876543210",
        street: "789 Residential Complex, Block C",
        city: "Pune",
        state: "Maharashtra",
        zipCode: "411001",
        country: "India",
        isDefault: false,
        type: "Other",
    },
];

const addressTypeIcons = {
    Home: Home,
    Work: Briefcase,
    Other: Map,
};

function AddressesPageContent() {
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zipCode: "",
        type: "Home" as "Home" | "Work" | "Other",
        isDefault: false,
    });

    const handleSetDefault = (id: string) => {
        setAddresses(
            addresses.map((addr) => ({
                ...addr,
                isDefault: addr.id === id,
            }))
        );
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            setAddresses(addresses.filter((addr) => addr.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted:", formData);
        setShowAddForm(false);
        setFormData({
            name: "",
            phone: "",
            street1: "",
            street2: "",
            city: "",
            state: "",
            zipCode: "",
            type: "Home",
            isDefault: false,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-hkgb text-gray-900 mb-1 sm:mb-2">
                                    Saved Addresses
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Manage your delivery addresses for faster checkout
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                Add New Address
                            </button>
                        </div>

                        {/* Add Address Form */}
                        {showAddForm && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                        Add New Address
                                    </h2>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    {/* Personal Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                                <User className="w-4 h-4 inline mr-2 text-gray-500" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                                <Phone className="w-4 h-4 inline mr-2 text-gray-500" />
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Address Details */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            <MapPin className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.street1}
                                            onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                            placeholder="House/Flat No., Building Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            <Building className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Address Line 2 (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.street2}
                                            onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                            placeholder="Street, Area, Landmark"
                                        />
                                    </div>

                                    {/* City/State/ZIP */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                                placeholder="Enter city"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                                placeholder="Enter state"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                                PIN Code
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.zipCode}
                                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                                placeholder="Enter PIN code"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Address Type & Default */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                                Address Type
                                            </label>
                                            <div className="flex gap-2">
                                                {(["Home", "Work", "Other"] as const).map((type) => {
                                                    const Icon = addressTypeIcons[type];
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, type })}
                                                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${formData.type === type
                                                                ? "border-[#008ECC] bg-blue-50 text-[#008ECC]"
                                                                : "border-gray-200 text-gray-700 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{type}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                                Default Address
                                            </label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="setDefault"
                                                    checked={formData.isDefault}
                                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#008ECC] border-gray-300 rounded focus:ring-[#008ECC]"
                                                />
                                                <label htmlFor="setDefault" className="text-sm sm:text-base text-gray-700 cursor-pointer">
                                                    Set as default address for deliveries
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm sm:text-base"
                                        >
                                            Save Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Addresses List */}
                        {addresses.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <MapPin className="text-gray-400 w-8 h-8" />
                                </div>
                                <p className="text-lg font-hkgb text-gray-900 mb-2">No addresses saved</p>
                                <p className="text-gray-600 text-sm mb-6">
                                    Add an address to get started with faster checkout
                                </p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-hkgb text-sm"
                                >
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {addresses.map((address) => {
                                    const Icon = addressTypeIcons[address.type];
                                    return (
                                        <div
                                            key={address.id}
                                            className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-6 relative hover:shadow-md transition-all duration-300 ${address.isDefault
                                                ? "border-[#008ECC]"
                                                : "border-gray-100 hover:border-gray-200"
                                                }`}
                                        >
                                            {/* Default Badge */}
                                            {address.isDefault && (
                                                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 bg-[#008ECC] text-white text-xs font-hkgb rounded-full flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    DEFAULT
                                                </div>
                                            )}

                                            {/* Address Type */}
                                            <div className="mb-3 sm:mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${address.type === 'Home' ? 'bg-blue-100 text-blue-600' : address.type === 'Work' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{address.type}</span>
                                                </div>
                                            </div>

                                            {/* Address Details */}
                                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                                <p className="text-sm sm:text-base font-hkgb text-gray-900">
                                                    {address.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    {address.phone}
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    <p>{address.street}</p>
                                                    <p>{address.city}, {address.state} {address.zipCode}</p>
                                                    <p>{address.country}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    disabled={address.isDefault}
                                                    className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${address.isDefault
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {address.isDefault ? "Default" : "Set Default"}
                                                </button>
                                                <button className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                                                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="text-xs sm:text-sm">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="text-xs sm:text-sm">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Help Text */}
                        <div className="mt-6 sm:mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#008ECC] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm sm:text-base font-hkgb text-gray-900 mb-2">
                                        Address Management Tips
                                    </h3>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• You can have up to 5 saved addresses</li>
                                        <li>• Default address will be used for all deliveries</li>
                                        <li>• Update addresses regularly for accurate delivery</li>
                                        <li>• Different addresses for home, work, and others</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function AddressesPage() {
    return (
        <ProtectedRoute>
            <AddressesPageContent />
        </ProtectedRoute>
    );
}
