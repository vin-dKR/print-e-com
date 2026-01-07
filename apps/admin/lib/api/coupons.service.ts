/**
 * Coupons Service
 * Handles coupon management operations for admin
 */

import { get, post, put, del } from './api-client';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type CouponApplicableTo = 'ALL' | 'CATEGORY' | 'PRODUCT';

export interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usageLimitPerUser: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    applicableTo: CouponApplicableTo;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCouponData {
    code: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    validFrom: string;
    validUntil: string;
    isActive?: boolean;
    applicableTo?: CouponApplicableTo;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
    id: string;
}

/**
 * Get all coupons
 */
export async function getCoupons(): Promise<Coupon[]> {
    const response = await get<Coupon[]>('/admin/coupons');

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch coupons');
    }

    return response.data;
}

/**
 * Get single coupon by ID
 */
export async function getCoupon(id: string): Promise<Coupon> {
    const response = await get<Coupon>(`/admin/coupons/${id}`);

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch coupon');
    }

    return response.data;
}

/**
 * Create new coupon
 */
export async function createCoupon(data: CreateCouponData): Promise<Coupon> {
    const response = await post<Coupon>('/admin/coupons', data);

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create coupon');
    }

    return response.data;
}

/**
 * Update coupon
 */
export async function updateCoupon(data: UpdateCouponData): Promise<Coupon> {
    const { id, ...updateData } = data;
    const response = await put<Coupon>(`/admin/coupons/${id}`, updateData);

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update coupon');
    }

    return response.data;
}

/**
 * Delete coupon
 */
export async function deleteCoupon(id: string): Promise<void> {
    const response = await del(`/admin/coupons/${id}`);

    if (!response.success) {
        throw new Error(response.error || 'Failed to delete coupon');
    }
}

