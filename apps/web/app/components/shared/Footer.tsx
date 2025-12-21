"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-50 mt-auto">
      {/* Newsletter Subscription Banner */}
      <div className="bg-blue-600 rounded-t-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Grow Your Brand With Professional Printing Solutions
              </h3>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[300px]">
              <div className="relative">
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-blue-600 rounded-sm transform rotate-12"></div>
                  <div className="w-8 h-8 bg-yellow-400 rounded-sm transform -rotate-12 -ml-2"></div>
                </div>
                <span className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                  PrintEcom
                </span>
              </Link>
              <p className="text-gray-600 text-sm mb-6">
                We have clothes that suits your style and which you're proud to wear. From women to men.
              </p>
              <div className="flex items-center gap-3">
                {/* Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-700"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-700"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-700"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-700"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/works"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/career"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Help */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Help
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/support"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/delivery"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Delivery Details
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: FAQ */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                FAQ
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/faq/account"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq/deliveries"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Manage Deliveries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq/orders"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq/payments"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Payments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Resources */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/resources/ebooks"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Free eBooks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources/tutorial"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Development Tutorial
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources/blog"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    How to - Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources/youtube"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Youtube Playlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-600">
              PrintEcom © 2000-{currentYear}. All Rights Reserved
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              {/* VISA */}
              <div className="flex items-center justify-center w-12 h-8 bg-white rounded border border-gray-200">
                <span className="text-xs font-bold text-blue-900">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="flex items-center justify-center w-12 h-8 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-orange-500 -ml-1.5"></div>
                </div>
              </div>
              {/* PayPal */}
              <div className="flex items-center justify-center w-12 h-8 bg-white rounded border border-gray-200">
                <span className="text-xs font-bold text-blue-700">PP</span>
              </div>
              {/* Apple Pay */}
              <div className="flex items-center justify-center w-12 h-8 bg-white rounded border border-gray-200">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-900"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                </svg>
              </div>
              {/* Google Pay */}
              <div className="flex items-center justify-center w-12 h-8 bg-white rounded border border-gray-200">
                <span className="text-xs font-bold text-gray-700">G</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
