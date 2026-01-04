/**
 * Orders API functions
 */

import { get, post, ApiResponse } from '../api-client';

export type OrderStatus =
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'ONLINE' | 'OFFLINE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  customDesignUrl?: string;
  customText?: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    images?: Array<{ url: string }>;
  };
  variant?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  subtotal?: number;
  discountAmount?: number;
  shippingCharges?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  couponId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    customDesignUrl?: string;
    customText?: string;
  }>;
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get user's orders
 */
export async function getMyOrders(): Promise<ApiResponse<OrdersResponse>> {
  return get<OrdersResponse>('/customer/orders');
}

/**
 * Get single order by ID
 */
export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  return get<Order>(`/customer/orders/${id}`);
}

/**
 * Create new order
 */
export async function createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
  return post<Order>('/customer/orders', data);
}

