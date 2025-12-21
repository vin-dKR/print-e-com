import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendSuccess } from "../utils/response";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors";

// Get product reviews
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            throw new ValidationError("Product ID is required");
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt"; // createdAt, rating, helpful
        const order = (req.query.order as string) || "desc";

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const orderBy: any = {};
        if (sortBy === "helpful") {
            orderBy.isHelpful = order === "asc" ? "asc" : "desc";
        } else if (sortBy === "rating") {
            orderBy.rating = order === "asc" ? "asc" : "desc";
        } else {
            orderBy.createdAt = order === "asc" ? "asc" : "desc";
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: {
                    productId,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    helpfulVotes: req.user ? {
                        where: { userId: req.user.id },
                    } : false,
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.review.count({
                where: {
                    productId,
                    isApproved: true,
                },
            }),
        ]);

        // Calculate rating distribution
        const ratingDistribution = await prisma.review.groupBy({
            by: ["rating"],
            where: {
                productId,
                isApproved: true,
            },
            _count: true,
        });

        return sendSuccess(res, {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            ratingDistribution: ratingDistribution.reduce((acc, item) => {
                acc[item.rating] = item._count;
                return acc;
            }, {} as Record<number, number>),
        });
    } catch (error) {
        next(error);
    }
};

// Create review
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { productId } = req.params;

        if (!productId) {
            throw new ValidationError("Product ID is required");
        }
        const { rating, title, comment, images = [] } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            throw new ValidationError("Rating must be between 1 and 5");
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError("Product not found"); 
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId: req.user.id,
                },
            },
        });

        if (existingReview) {
            throw new ValidationError("You have already reviewed this product");
        }

        // Check if user has purchased this product (optional verification)
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId: req.user.id,
                    paymentStatus: "SUCCESS",
                },
            },
        });

        const review = await prisma.review.create({
            data: {
                productId,
                userId: req.user.id,
                rating,
                title: title || null,
                comment: comment || null,
                images,
                isVerifiedPurchase: !!hasPurchased,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update product rating and review count
        const allReviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        return sendSuccess(res, review, "Review created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        if (!reviewId) {
            throw new ValidationError("Review ID is required");
        }
        const { rating, title, comment, images } = req.body;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        if (review.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to update this review");
        }

        const updateData: any = {};
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                throw new ValidationError("Rating must be between 1 and 5");
            }
            updateData.rating = rating;
        }
        if (title !== undefined) updateData.title = title;
        if (comment !== undefined) updateData.comment = comment;
        if (images !== undefined) updateData.images = images;

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: review.productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: avgRating,
            },
        });

        return sendSuccess(res, updatedReview, "Review updated successfully");
    } catch (error) {
        next(error);
    }
};

// Delete review
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        if (review.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to delete this review");
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: review.productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : null;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        return sendSuccess(res, null, "Review deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Vote review as helpful
export const voteReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        if (!reviewId) {
            throw new ValidationError("Review ID is required");
        }
        const { isHelpful = true } = req.body;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        // Check if already voted
        const existingVote = await prisma.reviewHelpfulVote.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: req.user.id,
                },
            },
        });

        if (existingVote) {
            // Update vote
            await prisma.reviewHelpfulVote.update({
                where: { id: existingVote.id },
                data: { isHelpful },
            });
        } else {
            // Create vote
            await prisma.reviewHelpfulVote.create({
                data: {
                    reviewId,
                    userId: req.user.id,
                    isHelpful,
                },
            });
        }

        // Update helpful count
        const helpfulCount = await prisma.reviewHelpfulVote.count({
            where: {
                reviewId,
                isHelpful: true,
            },
        });

        await prisma.review.update({
            where: { id: reviewId },
            data: { isHelpful: helpfulCount },
        });

        return sendSuccess(res, { helpfulCount }, "Vote recorded successfully");
    } catch (error) {
        next(error);
    }
};

