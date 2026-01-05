import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { razorpay } from "../services/razorpay";
import { prisma } from "../services/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors";

// Create Razorpay order
export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            throw new ValidationError("Order ID and amount are required");
        }

        // Verify order belongs to user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: req.user.id,
                paymentMethod: "ONLINE",
                paymentStatus: "PENDING",
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found or already paid");
        }

        if (Number(order.total) !== Number(amount)) {
            throw new ValidationError("Amount mismatch");
        }

        if (!razorpay) {
            return sendError(res, "Razorpay not configured", 500);
        }

        // Create Razorpay order
        const amountInPaise = Math.round(Number(amount) * 100); // Convert to paise
        // Razorpay receipt has a max length of 40 chars – keep it short and deterministic
        const shortOrderId = String(order.id).slice(0, 30);
        const receipt = `ord_${shortOrderId}`;
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt,
            notes: {
                orderId: order.id,
                userId: req.user.id,
            },
        });

        // Update order with Razorpay order ID
        await prisma.order.update({
            where: { id: orderId },
            data: { razorpayOrderId: razorpayOrder.id },
        });

        // Create payment record
        await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: req.user.id,
                amount: order.total,
                razorpayOrderId: razorpayOrder.id,
                method: "ONLINE",
                status: "PENDING",
            },
        });

        const orderAmount = typeof razorpayOrder.amount === "number"
            ? razorpayOrder.amount / 100
            : Number(razorpayOrder.amount) / 100;

        return sendSuccess(res, {
            razorpayOrderId: razorpayOrder.id,
            amount: orderAmount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        }, "Razorpay order created successfully");
    } catch (error) {
        next(error);
    }
};

// Verify Razorpay payment
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new ValidationError("Missing payment verification data");
        }

        // Find order and payment
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId: req.user.id,
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        const payment = await prisma.payment.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId: req.user.id,
            },
        });

        if (!payment) {
            throw new NotFoundError("Payment record not found");
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(text)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            // Update payment as failed
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED" },
            });

            return sendError(res, "Payment verification failed", 400);
        }

        // Update payment and order
        await Promise.all([
            prisma.payment.update({
                where: { id: payment.id },
                data: {
                    razorpayPaymentId: razorpay_payment_id,
                    status: "SUCCESS",
                },
            }),
            prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: "SUCCESS" },
            }),
        ]);

        return sendSuccess(res, {
            verified: true,
            orderId: order.id,
            paymentId: payment.id,
        }, "Payment verified successfully");
    } catch (error) {
        next(error);
    }
};

// Razorpay webhook
export const razorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
        const signature = req.headers["x-razorpay-signature"] as string;

        if (!signature) {
            return sendError(res, "Missing signature", 400);
        }

        const body = JSON.stringify(req.body);
        const generatedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (generatedSignature !== signature) {
            return sendError(res, "Invalid signature", 400);
        }

        const event = req.body.event;
        const payload = req.body.payload;

        // Handle different webhook events
        switch (event) {
            case "payment.captured":
                await handlePaymentCaptured(payload);
                break;
            case "payment.failed":
                await handlePaymentFailed(payload);
                break;
            case "order.paid":
                await handleOrderPaid(payload);
                break;
            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        return sendSuccess(res, { received: true }, "Webhook processed");
    } catch (error) {
        next(error);
    }
};

// Helper functions for webhook handlers
async function handlePaymentCaptured(payload: any) {
    const paymentEntity = payload?.payment?.entity;

    if (!paymentEntity) {
        console.warn("Razorpay webhook: missing payment entity in payload for payment.captured");
        return;
    }

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;

    if (!razorpayPaymentId) {
        console.warn("Razorpay webhook: missing payment id in payment.captured payload");
        return;
    }

    await prisma.payment.updateMany({
        where: { razorpayPaymentId },
        data: {
            status: "SUCCESS",
            razorpayPaymentId,
        },
    });

    if (razorpayOrderId) {
        await prisma.order.updateMany({
            where: { razorpayOrderId },
            data: { paymentStatus: "SUCCESS" },
        });
    }
}

async function handlePaymentFailed(payload: any) {
    const paymentEntity = payload?.payment?.entity;

    if (!paymentEntity) {
        console.warn("Razorpay webhook: missing payment entity in payload for payment.failed");
        return;
    }

    const razorpayPaymentId = paymentEntity.id;

    if (!razorpayPaymentId) {
        console.warn("Razorpay webhook: missing payment id in payment.failed payload");
        return;
    }

    await prisma.payment.updateMany({
        where: { razorpayPaymentId },
        data: { status: "FAILED" },
    });
}

async function handleOrderPaid(payload: any) {
    const orderEntity = payload?.order?.entity;

    if (!orderEntity) {
        console.warn("Razorpay webhook: missing order entity in payload for order.paid");
        return;
    }

    const razorpayOrderId = orderEntity.id;

    if (!razorpayOrderId) {
        console.warn("Razorpay webhook: missing order id in order.paid payload");
        return;
    }

    await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: { paymentStatus: "SUCCESS" },
    });
}

