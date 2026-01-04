"use client";

import { useState } from "react";
import {
    User, Mail, Phone, Lock, Bell, Shield, AlertTriangle,
    Save, Eye, EyeOff, Globe, Users, Check
} from "lucide-react";

function SettingsPageContent() {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        orderUpdates: true,
        promotions: false,
        newsletters: false,
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
    });

    const [accountForm, setAccountForm] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 9876543210",
    });

    const handleNotificationChange = (key: string, value: boolean) => {
        setNotifications({ ...notifications, [key]: value });
    };

    const handlePrivacyChange = (key: string, value: string | boolean) => {
        setPrivacy({ ...privacy, [key]: value });
    };

    const handlePasswordFormChange = (key: string, value: string | boolean) => {
        setPasswordForm({ ...passwordForm, [key]: value });
    };

    const handleAccountFormChange = (key: string, value: string) => {
        setAccountForm({ ...accountForm, [key]: value });
    };

    return (
        <>
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
                        {/* Header */}
                        <div className="mb-4 sm:mb-6">
                            <h1 className="text-xl sm:text-2xl font-hkgb text-gray-900 mb-1 sm:mb-2">
                                Account Settings
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        {/* Account Information Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#008ECC]" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Account Information
                                </h2>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={accountForm.name}
                                        onChange={(e) => handleAccountFormChange("name", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={accountForm.email}
                                        onChange={(e) => handleAccountFormChange("email", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={accountForm.phone}
                                        onChange={(e) => handleAccountFormChange("phone", e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm sm:text-base">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#008ECC]" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Change Password
                                </h2>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={passwordForm.showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => handlePasswordFormChange("currentPassword", e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base pr-10"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handlePasswordFormChange("showCurrentPassword", !passwordForm.showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {passwordForm.showCurrentPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={passwordForm.showNewPassword ? "text" : "password"}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => handlePasswordFormChange("newPassword", e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base pr-10"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handlePasswordFormChange("showNewPassword", !passwordForm.showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {passwordForm.showNewPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={passwordForm.showConfirmPassword ? "text" : "password"}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => handlePasswordFormChange("confirmPassword", e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008ECC] focus:border-transparent text-sm sm:text-base pr-10"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handlePasswordFormChange("showConfirmPassword", !passwordForm.showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {passwordForm.showConfirmPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#008ECC] text-white rounded-lg hover:bg-[#0077B3] transition-colors font-medium text-sm sm:text-base">
                                    <Lock className="w-4 h-4" />
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#008ECC]" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Notification Preferences
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {Object.entries({
                                    email: { label: "Email Notifications", desc: "Receive notifications via email", icon: Mail },
                                    sms: { label: "SMS Notifications", desc: "Receive notifications via SMS", icon: Phone },
                                    push: { label: "Push Notifications", desc: "Receive push notifications on your device", icon: Bell },
                                    orderUpdates: { label: "Order Updates", desc: "Get notified about your order status", icon: Check },
                                    promotions: { label: "Promotions & Offers", desc: "Receive promotional emails and offers", icon: Check },
                                    newsletters: { label: "Newsletters", desc: "Subscribe to our newsletter", icon: Check },
                                }).map(([key, config]) => (
                                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                {config.icon && <config.icon className="w-4 h-4 text-gray-600" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{config.label}</p>
                                                <p className="text-xs text-gray-500 mt-1">{config.desc}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications[key as keyof typeof notifications]}
                                                onChange={(e) =>
                                                    handleNotificationChange(key, e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008ECC] peer-focus:ring-2 peer-focus:ring-[#008ECC]"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#008ECC]" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-gray-900">
                                    Privacy Settings
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Visibility
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {[
                                            { value: "public", label: "Public", icon: Globe, desc: "Visible to everyone" },
                                            { value: "private", label: "Private", icon: Shield, desc: "Only you can see" },
                                            { value: "friends", label: "Friends Only", icon: Users, desc: "Visible to friends" },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handlePrivacyChange("profileVisibility", option.value)}
                                                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border transition-all ${privacy.profileVisibility === option.value
                                                    ? "border-[#008ECC] bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <option.icon className={`w-5 h-5 mb-2 ${privacy.profileVisibility === option.value ? 'text-[#008ECC]' : 'text-gray-500'}`} />
                                                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                                <span className="text-xs text-gray-500 mt-1">{option.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Show Email</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Allow others to see your email address
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={privacy.showEmail}
                                                onChange={(e) =>
                                                    handlePrivacyChange("showEmail", e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008ECC] peer-focus:ring-2 peer-focus:ring-[#008ECC]"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Show Phone</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Allow others to see your phone number
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={privacy.showPhone}
                                                onChange={(e) =>
                                                    handlePrivacyChange("showPhone", e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008ECC] peer-focus:ring-2 peer-focus:ring-[#008ECC]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                <h2 className="text-lg sm:text-xl font-hkgb text-red-600">
                                    Danger Zone
                                </h2>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-700">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base">
                                        Delete Account
                                    </button>
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base">
                                        Request Data Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
    );
}

export default function SettingsPage() {
    return <SettingsPageContent />;
}
