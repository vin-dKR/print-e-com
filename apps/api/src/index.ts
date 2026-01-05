import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import redoc from "redoc-express";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";

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
import webhookRoutes from "./routes/webhook";

import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://print-e-com-web.vercel.app",
    // Allow additional origins from environment variable (comma-separated)
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()) : []),
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
// WIP: not in use now
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve OpenAPI YAML spec (for Redoc UI)
app.get("/api/openapi.yaml", (_req, res) => {
    const specPath = path.join(process.cwd(), "openapi.yaml");
    const yaml = fs.readFileSync(specPath, "utf8");
    res.type("text/yaml").send(yaml);
});

// Serve API documentation UI at /api/docs using Redoc
app.get(
    "/api/docs",
    redoc({
        title: "Custom Printing E-commerce API Docs",
        specUrl: "/api/openapi.yaml"
    })
);

// Load OpenAPI spec once for Swagger UI
const openapiSpecPath = path.join(process.cwd(), "openapi.yaml");
const openapiDocument = yaml.load(fs.readFileSync(openapiSpecPath, "utf8")) as object;

// Interactive API playground using Swagger UI
app.use("/api/playground", swaggerUi.serve, swaggerUi.setup(openapiDocument));

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
// Webhooks (public endpoints called by Razorpay, etc.)
app.use("/api/webhooks", webhookRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/customer", customerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
