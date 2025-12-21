"use client";

import { useState } from "react";

export default function PaymentMethod() {
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "creditcard">("creditcard");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

      <div className="space-y-4">
        {/* PayPal Option */}
        <label
          className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            paymentMethod === "paypal"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="paypal"
            checked={paymentMethod === "paypal"}
            onChange={() => setPaymentMethod("paypal")}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">PayPal</p>
              <p className="text-sm text-gray-600">
                You will be redirected to the PayPal website after submitting your order
              </p>
            </div>
            <div className="ml-4">
              <div className="w-16 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                PayPal
              </div>
            </div>
          </div>
        </label>

        {/* Credit Card Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            paymentMethod === "creditcard"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="creditcard"
            checked={paymentMethod === "creditcard"}
            onChange={() => setPaymentMethod("creditcard")}
            className="w-5 h-5 mt-1 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-900">Pay with Credit Card</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-900 bg-blue-100 px-2 py-1 rounded">
                  VISA
                </span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  DISCOVER
                </span>
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                  MASTERCARD
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  AMEX
                </span>
              </div>
            </div>

            {paymentMethod === "creditcard" && (
              <div className="space-y-4 mt-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) =>
                        setCardData({ ...cardData, cardNumber: e.target.value })
                      }
                      placeholder="1234 5678 9101 3456"
                      maxLength={19}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {cardData.cardNumber && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Expiration Date & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      value={cardData.expirationDate}
                      onChange={(e) =>
                        setCardData({ ...cardData, expirationDate: e.target.value })
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Security Code
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="***"
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <a
                        href="#"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:underline"
                      >
                        What is this?
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Security Message */}
      <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>We protect your payment information using encryption to provide bank-level security.</span>
      </div>
    </div>
  );
}
