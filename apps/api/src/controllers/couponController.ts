import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendSuccess } from "../utils/response";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors";

// Validate and get coupon details
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => { 
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { code, orderAmount } = req.body;
 
        if (!code) {
            throw new ValidationError("Coupon code is required");
        }

        if (!orderAmount || orderAmount <= 0) {
            throw new ValidationError("Order amount is required");
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                offerProducts: {
                    include: { product: true },
                },
            },
        });

        if (!coupon) {
            throw new NotFoundError("Invalid coupon code");
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            throw new ValidationError("Coupon is not active");
        }

        // Check validity period
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            throw new ValidationError("Coupon has expired or is not yet valid");
        }

        // Check minimum purchase amount
        if (coupon.minPurchaseAmount && orderAmount < Number(coupon.minPurchaseAmount)) {
            throw new ValidationError(
                `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`
            );
        }

        // Check usage limit
        if (coupon.usageLimit !== null) {
            const usageCount = await prisma.couponUsage.count({
                where: { couponId: coupon.id },
            });
            if (usageCount >= coupon.usageLimit) {
                throw new ValidationError("Coupon usage limit reached");
            }
        }

        // Check per-user usage limit
        const userUsageCount = await prisma.couponUsage.count({
            where: {
                couponId: coupon.id,
                userId: req.user.id,
            },
        });
        if (userUsageCount >= coupon.usageLimitPerUser) {
            throw new ValidationError("You have already used this coupon");
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
        } else {
            discountAmount = Number(coupon.discountValue);
        }

        // Apply maximum discount cap
        if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
            discountAmount = Number(coupon.maxDiscountAmount);
        }

        // Ensure discount doesn't exceed order amount
        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }

        return sendSuccess(res, {
            coupon: {
                id: coupon.id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
            finalAmount: orderAmount - discountAmount,
        });
    } catch (error) {
        next(error);
    }
};

// Get available coupons (public)
export const getAvailableCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();

        const coupons = await prisma.coupon.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                validUntil: { gte: now },
            },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                discountType: true,
                discountValue: true,
                minPurchaseAmount: true,
                maxDiscountAmount: true,
                validUntil: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return sendSuccess(res, coupons);
    } catch (error) {
        next(error);
    }
};

// Get user's coupon usage history
export const getMyCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const couponUsages = await prisma.couponUsage.findMany({
            where: { userId: req.user.id },
            include: {
                coupon: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        discountType: true,
                        discountValue: true,
                    },
                },
            },
            orderBy: { usedAt: "desc" },
        });

        return sendSuccess(res, couponUsages);
    } catch (error) {
        next(error);
    }
};

