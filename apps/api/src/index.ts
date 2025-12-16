import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customer";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payment";
import uploadRoutes from "./routes/upload";
import webhookRoutes from "./routes/webhook";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Custom Printing E-commerce API"
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

/**
 * WIP : since we are not using upload feature for now, we will not implement this with the user authentication in future.
 */
// app.use("/api", uploadRoutes);'


// WIP : since we are not using webhook feature for now, we will not implement this with the user authentication in future.
// app.use("/api/webhooks", webhookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
});
