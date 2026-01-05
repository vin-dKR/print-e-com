/**
 * Payments API functions (Razorpay)
 */

import { post, type ApiResponse } from "../api-client";

export interface CreateRazorpayOrderRequest {
    orderId: string;
    amount: number;
}

export interface CreateRazorpayOrderResponse {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    key?: string;
}

export interface VerifyRazorpayPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyRazorpayPaymentResponse {
    verified: boolean;
    orderId: string;
    paymentId: string;
}

/**
 * Create a Razorpay order for an existing backend order
 */
export async function createRazorpayOrder(
    data: CreateRazorpayOrderRequest
): Promise<ApiResponse<CreateRazorpayOrderResponse>> {
    return post<CreateRazorpayOrderResponse>("/payment/create-order", data);
}

/**
 * Verify Razorpay payment after successful checkout
 */
export async function verifyRazorpayPayment(
    data: VerifyRazorpayPaymentRequest
): Promise<ApiResponse<VerifyRazorpayPaymentResponse>> {
    return post<VerifyRazorpayPaymentResponse>("/payment/verify", data);
}


