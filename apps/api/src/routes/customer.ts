import { Router, type IRouter } from "express";
import {
    createOrder,
    getMyOrders,
    getOrder,
    trackOrder,
} from "../controllers/orderController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

// Public route (with email/phone verification)
router.get("/orders/:id/track", trackOrder);

// Protected routes
router.use(customerAuth);

// Order routes
router.post("/orders", createOrder);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrder);

export default router;

