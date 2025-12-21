import { Router, type IRouter } from "express";
import {
    createOrder,
    getMyOrders,
    getOrder,
    trackOrder,
} from "../controllers/orderController";
import { customerAuth } from "../middleware/auth";
import { createAddress } from "../controllers/addressController";

const router: IRouter = Router();

/**
 * Customer Routes
 * Routes for customer-specific operations (orders, addresses)
 * Most routes require customer authentication
 */

// Public route (with email/phone verification)
router.get("/orders/:id/track", trackOrder);

// Protected routes - require customer authentication
router.use(customerAuth);

// Address routes
router.post("/address", createAddress);

// Order routes
router.post("/orders", createOrder);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrder);

export default router;
