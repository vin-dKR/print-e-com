import { Router, type IRouter } from "express";
import {
    validateCoupon,
    getAvailableCoupons,
    getMyCoupons,
} from "../controllers/couponController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

/**
 * Coupon Routes
 * Public routes for viewing available coupons
 * Protected routes for validating and using coupons
 */

// Public routes
router.get("/available", getAvailableCoupons);

// Protected routes
router.use(customerAuth);
router.post("/validate", validateCoupon);
router.get("/my-coupons", getMyCoupons);

export default router;

