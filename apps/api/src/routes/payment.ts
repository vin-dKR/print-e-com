import { Router, type IRouter } from "express";
import {
    createRazorpayOrder,
    verifyPayment,
    razorpayWebhook,
} from "../controllers/paymentController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

// Protected routes
router.post("/create-order", customerAuth, createRazorpayOrder);
router.post("/verify", customerAuth, verifyPayment);

// Public webhook (Razorpay will call this)
// Note: This route is registered separately in index.ts as /api/webhooks/razorpay

export default router;

