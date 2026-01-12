import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

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

/**
 * @openapi
 * /api/v1/admin/coupons:
 *   get:
 *     summary: Get all coupons
 *     description: Admin can view all coupons with usage statistics
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       discountType:
 *                         type: string
 *                         enum: [PERCENTAGE, FIXED]
 *                       discountValue:
 *                         type: number
 *                       minPurchaseAmount:
 *                         type: number
 *                         nullable: true
 *                       maxDiscountAmount:
 *                         type: number
 *                         nullable: true
 *                       usageLimit:
 *                         type: integer
 *                         nullable: true
 *                       usageLimitPerUser:
 *                         type: integer
 *                       validFrom:
 *                         type: string
 *                         format: date-time
 *                       validUntil:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 *                       applicableTo:
 *                         type: string
 *                         enum: [ALL, CATEGORY, PRODUCT]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       _count:
 *                         type: object
 *                         properties:
 *                           usages:
 *                             type: integer
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get all coupons
export const getAdminCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                _count: {
                    select: {
                        usages: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return sendSuccess(res, coupons);
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/{id}:
 *   get:
 *     summary: Get single coupon by ID
 *     description: Admin can view detailed coupon information including usage history
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     discountType:
 *                       type: string
 *                     discountValue:
 *                       type: number
 *                     minPurchaseAmount:
 *                       type: number
 *                       nullable: true
 *                     maxDiscountAmount:
 *                       type: number
 *                       nullable: true
 *                     usageLimit:
 *                       type: integer
 *                       nullable: true
 *                     usageLimitPerUser:
 *                       type: integer
 *                     validFrom:
 *                       type: string
 *                       format: date-time
 *                     validUntil:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *                     applicableTo:
 *                       type: string
 *                     usages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     offerProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     _count:
 *                       type: object
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get single coupon
export const getAdminCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Coupon ID is required");
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                usages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { usedAt: "desc" },
                },
                offerProducts: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        usages: true,
                    },
                },
            },
        });

        if (!coupon) {
            throw new NotFoundError("Coupon not found");
        }

        return sendSuccess(res, coupon);
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons:
 *   post:
 *     summary: Create new coupon
 *     description: Admin can create a new discount coupon
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - discountType
 *               - discountValue
 *               - validFrom
 *               - validUntil
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SAVE20"
 *               name:
 *                 type: string
 *                 example: "Save 20% Off"
 *               description:
 *                 type: string
 *                 example: "Get 20% off on all products"
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *                 example: "PERCENTAGE"
 *               discountValue:
 *                 type: number
 *                 example: 20
 *               minPurchaseAmount:
 *                 type: number
 *                 nullable: true
 *                 example: 1000
 *               maxDiscountAmount:
 *                 type: number
 *                 nullable: true
 *                 example: 500
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *                 example: 100
 *               usageLimitPerUser:
 *                 type: integer
 *                 example: 1
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               applicableTo:
 *                 type: string
 *                 enum: [ALL, CATEGORY, PRODUCT]
 *                 example: "ALL"
 *     responses:
 *       200:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Coupon created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or coupon code already exists
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Create coupon
export const createAdminCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            code,
            name,
            description,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            usageLimit,
            usageLimitPerUser,
            validFrom,
            validUntil,
            isActive,
            applicableTo,
        } = req.body;

        if (!code || !name || !discountType || !discountValue || !validFrom || !validUntil) {
            throw new ValidationError("Required fields: code, name, discountType, discountValue, validFrom, validUntil");
        }

        // Check if code already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingCoupon) {
            throw new ValidationError("Coupon code already exists");
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                name,
                description,
                discountType,
                discountValue: Number(discountValue),
                minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : null,
                maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : 1,
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                isActive: isActive !== undefined ? isActive : true,
                applicableTo: applicableTo || "ALL",
            },
        });

        return sendSuccess(res, coupon, "Coupon created successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/{id}:
 *   put:
 *     summary: Update coupon
 *     description: Admin can update coupon details
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *               discountValue:
 *                 type: number
 *               minPurchaseAmount:
 *                 type: number
 *                 nullable: true
 *               maxDiscountAmount:
 *                 type: number
 *                 nullable: true
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *               usageLimitPerUser:
 *                 type: integer
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               applicableTo:
 *                 type: string
 *                 enum: [ALL, CATEGORY, PRODUCT]
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Coupon updated successfully"
 *                 data:
 *                   type: object
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Update coupon
export const updateAdminCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            usageLimit,
            usageLimitPerUser,
            validFrom,
            validUntil,
            isActive,
            applicableTo,
        } = req.body;

        if (!id) {
            throw new ValidationError("Coupon ID is required");
        }

        const existingCoupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!existingCoupon) {
            throw new NotFoundError("Coupon not found");
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (discountType !== undefined) updateData.discountType = discountType;
        if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
        if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount ? Number(minPurchaseAmount) : null;
        if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
        if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? Number(usageLimit) : null;
        if (usageLimitPerUser !== undefined) updateData.usageLimitPerUser = Number(usageLimitPerUser);
        if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
        if (validUntil !== undefined) updateData.validUntil = new Date(validUntil);
        if (isActive !== undefined) updateData.isActive = isActive;
        if (applicableTo !== undefined) updateData.applicableTo = applicableTo;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: updateData,
        });

        return sendSuccess(res, coupon, "Coupon updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/{id}:
 *   delete:
 *     summary: Delete coupon
 *     description: Admin can delete a coupon
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Coupon deleted successfully"
 *                 data:
 *                   type: null
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Delete coupon
export const deleteAdminCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Coupon ID is required");
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundError("Coupon not found");
        }

        await prisma.coupon.delete({
            where: { id },
        });

        return sendSuccess(res, null, "Coupon deleted successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/stats:
 *   get:
 *     summary: Get coupon statistics
 *     description: Get overall coupon statistics including active count, total usage, total discount given, and expiring soon
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get coupon statistics
export const getCouponStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const [
            totalActive,
            totalUsage,
            totalDiscountResult,
            expiringSoon,
        ] = await Promise.all([
            prisma.coupon.count({
                where: {
                    isActive: true,
                    validFrom: { lte: now },
                    validUntil: { gte: now },
                },
            }),
            prisma.couponUsage.count(),
            prisma.payment.aggregate({
                _sum: { discountAmount: true },
                where: { couponId: { not: null } },
            }),
            prisma.coupon.count({
                where: {
                    isActive: true,
                    validUntil: {
                        gte: now,
                        lte: sevenDaysFromNow,
                    },
                },
            }),
        ]);

        return sendSuccess(res, {
            totalActive,
            totalUsage,
            totalDiscount: Number(totalDiscountResult._sum.discountAmount || 0),
            expiringSoon,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/{id}/analytics:
 *   get:
 *     summary: Get coupon analytics
 *     description: Get detailed analytics for a specific coupon including usage stats, revenue impact, and usage over time
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get coupon analytics
export const getCouponAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Coupon ID is required");
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                usages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { usages: true },
                },
            },
        });

        if (!coupon) {
            throw new NotFoundError("Coupon not found");
        }

        const totalDiscountResult = await prisma.payment.aggregate({
            _sum: { discountAmount: true },
            where: { couponId: id },
        });

        const uniqueUsers = new Set(coupon.usages.map((u) => u.userId)).size;
        const totalUses = coupon._count.usages;
        const totalDiscount = Number(totalDiscountResult._sum.discountAmount || 0);
        const averageDiscount = totalUses > 0 ? totalDiscount / totalUses : 0;

        // Usage over time (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const usageOverTime = await prisma.couponUsage.groupBy({
            by: ['usedAt'],
            where: {
                couponId: id,
                usedAt: {
                    gte: thirtyDaysAgo,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                usedAt: 'asc',
            },
        });

        return sendSuccess(res, {
            totalUses,
            uniqueUsers,
            totalDiscount,
            averageDiscount,
            usageOverTime: usageOverTime.map((item) => ({
                date: item.usedAt.toISOString().split('T')[0],
                count: item._count.id,
            })),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/bulk:
 *   post:
 *     summary: Bulk coupon operations
 *     description: Perform bulk operations on coupons (activate, deactivate, delete)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - operation
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               operation:
 *                 type: string
 *                 enum: [activate, deactivate, delete]
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Bulk coupon operations
export const bulkCouponOperation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids, operation } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new ValidationError("Coupon IDs are required");
        }

        if (!['activate', 'deactivate', 'delete'].includes(operation)) {
            throw new ValidationError("Invalid operation. Must be 'activate', 'deactivate', or 'delete'");
        }

        let result;
        switch (operation) {
            case 'activate':
                result = await prisma.coupon.updateMany({
                    where: { id: { in: ids } },
                    data: { isActive: true },
                });
                break;
            case 'deactivate':
                result = await prisma.coupon.updateMany({
                    where: { id: { in: ids } },
                    data: { isActive: false },
                });
                break;
            case 'delete':
                result = await prisma.coupon.deleteMany({
                    where: { id: { in: ids } },
                });
                break;
            default:
                throw new ValidationError("Invalid operation");
        }

        return sendSuccess(res, {
            message: `Successfully ${operation}d ${result.count} coupon(s)`,
            count: result.count,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/coupons/{id}/usages:
 *   get:
 *     summary: Get coupon usage history
 *     description: Get paginated usage history for a specific coupon
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Coupon ID
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Usage history retrieved successfully
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get coupon usage history
export const getCouponUsages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        if (!id) {
            throw new ValidationError("Coupon ID is required");
        }

        // Check if coupon exists
        const coupon = await prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundError("Coupon not found");
        }

        const [usages, total] = await Promise.all([
            prisma.couponUsage.findMany({
                where: { couponId: id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { usedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.couponUsage.count({
                where: { couponId: id },
            }),
        ]);

        // Get discount amounts from payments
        const usageWithDiscounts = await Promise.all(
            usages.map(async (usage) => {
                let discountAmount = 0;
                if (usage.orderId) {
                    const payment = await prisma.payment.findFirst({
                        where: {
                            orderId: usage.orderId,
                            couponId: id,
                        },
                        select: {
                            discountAmount: true,
                        },
                    });
                    discountAmount = payment ? Number(payment.discountAmount || 0) : 0;
                }
                return {
                    ...usage,
                    discountAmount,
                };
            })
        );

        return sendSuccess(res, {
            usages: usageWithDiscounts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

