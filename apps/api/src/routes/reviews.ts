import { Router, type IRouter } from "express";
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    voteReviewHelpful,
} from "../controllers/reviewController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

/**
 * Review Routes
 * Public routes for viewing reviews
 * Protected routes for creating/updating reviews
 */

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.use(customerAuth);
router.post("/product/:productId", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.post("/:reviewId/helpful", voteReviewHelpful);

export default router;

