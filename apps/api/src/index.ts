import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import authRoutes from "./routes/auth";
import publicRoutes from "./routes/public";
import customerRoutes from "./routes/customer";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payment";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/wishlist";
import reviewRoutes from "./routes/reviews";
import couponRoutes from "./routes/coupons";

import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
// WIP: not in use now
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Custom Printing E-commerce API"
    });
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes - Order matters! More specific routes before broader ones
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", publicRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/customer", customerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
