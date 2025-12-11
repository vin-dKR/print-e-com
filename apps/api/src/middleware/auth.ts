import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { sendError } from "../utils/response";
import { prisma } from "../services/prisma";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                type: "customer" | "admin";
            };
        }
    }
}

// Customer authentication using Supabase JWT
export const customerAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.substring(7);

        // Try Supabase first
        if (supabase) {
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (!error && user) {
                // Find or create user in our database
                let dbUser = await prisma.user.findUnique({
                    where: { supabaseId: user.id },
                });

                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email || "",
                            supabaseId: user.id,
                            name: user.user_metadata?.name || user.email?.split("@")[0],
                        },
                    });
                }

                req.user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    type: "customer",
                };
                return next();
            }
        }

        // Fallback: Try local JWT verification
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
        try {
            const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; type: string };

            if (decoded.type !== "customer") {
                throw new UnauthorizedError("Invalid token type");
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                throw new UnauthorizedError("User not found");
            }

            req.user = {
                id: user.id,
                email: user.email,
                type: "customer",
            };
            return next();
        } catch (jwtError) {
            throw new UnauthorizedError("Invalid or expired token");
        }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return sendError(res, error.message, 401);
        }
        return sendError(res, "Authentication failed", 401);
    }
};

// Admin authentication using JWT
export const adminAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

        const decoded = jwt.verify(token, jwtSecret) as { adminId: string; type: string };

        if (decoded.type !== "admin") {
            throw new UnauthorizedError("Invalid token type");
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.adminId },
        });

        if (!admin || !admin.isActive) {
            throw new ForbiddenError("Admin not found or inactive");
        }

        req.user = {
            id: admin.id,
            email: admin.email,
            type: "admin",
        };
        return next();
    } catch (error) {
        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            return sendError(res, error.message, error.statusCode);
        }
        return sendError(res, "Authentication failed", 401);
    }
};

