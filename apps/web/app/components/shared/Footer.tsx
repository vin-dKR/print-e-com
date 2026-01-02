"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const currentYear = new Date().getFullYear();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Newsletter subscription:", email);
        setEmail("");
    };

    return (
        <footer className="bg-[#F0F0F0] mt-auto">
            {/* Newsletter Section - Half in content, half in footer */}
            <div className="relative">
                {/* This creates the overlap effect */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                    <div className="w-full mx-auto px-30">
                        <div className="bg-[#1EADD8] rounded-2xl shadow-2xl p-8 px-20">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-2xl lg:text-5xl font-hkgb font-bold text-white text-center lg:text-left">
                                        Grow Your Brand With
                                    </h3>
                                    <h3 className="text-2xl lg:text-5xl font-hkgb font-bold text-white text-center lg:text-left">
                                        Professional Printing Solutions
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[400px]">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="text-gray-400"
                                            >
                                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-full bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to accommodate the newsletter section */}
            <div className="pt-32 lg:pt-40">
                {/* Main Footer Content */}
                <div className="bg-[#F0F0F0]">
                    <div className="w-full px-6 lg:px-30 py-12">
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                            {/* Column 1: Brand Info - Fixed width */}
                            <div className="lg:w-[300px] xl:w-[350px]">
                                <Link href="/" className="flex items-center gap-2 mb-6">
                                    <Image
                                        src="/images/pagz-logo.png"
                                        alt="PAGZ logo"
                                        width={120}
                                        height={120}
                                        className="w-24 h-24 lg:w-28 lg:h-28"
                                    />
                                </Link>
                                <p className="text-gray-600 text-xs lg:text-sm mb-8 leading-relaxed">
                                    We have printing solutions that suit your business needs and which you're proud to showcase. From business cards to large format prints.
                                </p>
                                <div className="flex items-center gap-2">
                                    <a
                                        href="#"
                                        className="relative w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group overflow-hidden"
                                        aria-label="Facebook"
                                    >
                                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="relative z-10 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200"
                                        >
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                        </svg>
                                    </a>

                                    <a
                                        href="#"
                                        className="relative w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group overflow-hidden"
                                        aria-label="Twitter"
                                    >
                                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="relative z-10 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200"
                                        >
                                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                        </svg>
                                    </a>

                                    <a
                                        href="#"
                                        className="relative w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group overflow-hidden"
                                        aria-label="Instagram"
                                    >
                                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="relative z-10 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200"
                                        >
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                        </svg>
                                    </a>

                                    <a
                                        href="#"
                                        className="relative w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group overflow-hidden"
                                        aria-label="LinkedIn"
                                    >
                                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="relative z-10 text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200"
                                        >
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                            <rect x="2" y="9" width="4" height="12"></rect>
                                            <circle cx="4" cy="4" r="2"></circle>
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Columns 2-5: Takes remaining space */}
                            <div className="flex-1">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                                    {/* Column 2: COMPANY */}
                                    <div>
                                        <h4 className="text-base font-hkgb font-normal text-gray-900 mb-4">COMPANY</h4>
                                        <ul className="space-y-2 lg:space-y-3">
                                            <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">About</Link></li>
                                            <li><Link href="/features" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Features</Link></li>
                                            <li><Link href="/works" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Works</Link></li>
                                            <li><Link href="/career" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Career</Link></li>
                                        </ul>
                                    </div>

                                    {/* Column 3: HELP */}
                                    <div>
                                        <h4 className="text-base font-hkgb font-normal text-gray-900 mb-4">HELP</h4>
                                        <ul className="space-y-2 lg:space-y-3">
                                            <li><Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Customer Support</Link></li>
                                            <li><Link href="/delivery" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Delivery Details</Link></li>
                                            <li><Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Terms & Conditions</Link></li>
                                            <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Privacy Policy</Link></li>
                                        </ul>
                                    </div>

                                    {/* Column 4: FAQ */}
                                    <div>
                                        <h4 className="text-base font-hkgb font-normal text-gray-900 mb-4">FAQ</h4>
                                        <ul className="space-y-2 lg:space-y-3">
                                            <li><Link href="/faq/account" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Account</Link></li>
                                            <li><Link href="/faq/deliveries" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Manage Deliveries</Link></li>
                                            <li><Link href="/faq/orders" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Orders</Link></li>
                                            <li><Link href="/faq/payments" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Payments</Link></li>
                                        </ul>
                                    </div>

                                    {/* Column 5: RESOURCES */}
                                    <div>
                                        <h4 className="text-base font-hkgb font-normal text-gray-900 mb-4">RESOURCES</h4>
                                        <ul className="space-y-2 lg:space-y-3">
                                            <li><Link href="/resources/ebooks" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Free eBooks</Link></li>
                                            <li><Link href="/resources/tutorial" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Development Tutorial</Link></li>
                                            <li><Link href="/resources/blog" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">How to - Blog</Link></li>
                                            <li><Link href="/resources/youtube" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">Youtube Playlist</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 bg-gray-50">
                    <div className="w-full px-6 lg:px-30 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-600 text-center md:text-left">
                                PrintPro © 2000-{currentYear}, All Rights Reserved
                            </p>
                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                                <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-blue-900">VISA</span>
                                </div>
                                <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                                    <div className="flex items-center gap-0.5 scale-75 sm:scale-100">
                                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-yellow-500 -ml-1"></div>
                                    </div>
                                </div>
                                <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-blue-700">PP</span>
                                </div>
                                <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
