import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase";
import {prisma} from "../services/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, UnauthorizedError, NotFoundError } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Customer Registration
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        // Try Supabase first
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name || email.split("@")[0],
                    },
                },
            });

            if (error) {
                return sendError(res, error.message, 400);
            }

            if (data.user) {
                // Create user in our database
                const user = await prisma.user.create({
                    data: {
                        email,
                        name: name || email.split("@")[0],
                        phone,
                        supabaseId: data.user.id,
                    },
                });

                return sendSuccess(res, {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }, "Registration successful", 201);
            }
        }

        // Fallback: Local registration (without Supabase)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return sendError(res, "User already exists", 400);
        }

        // For local, we'll just create the user (password hashing would be done by Supabase)
        // In a real scenario without Supabase, you'd hash the password here
        const user = await prisma.user.create({
            data: {
                email,
                name: name || email.split("@")[0],
                phone,
            },
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: "customer" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        }, "Registration successful", 201);
    } catch (error) {
        next(error);
    }
};

// Customer Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        // Try Supabase first
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return sendError(res, "Invalid credentials", 401);
            }

            if (data.user && data.session) {
                // Find or create user in our database
                let user = await prisma.user.findUnique({
                    where: { supabaseId: data.user.id },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: data.user.email || email,
                            supabaseId: data.user.id,
                            name: data.user.user_metadata?.name || email.split("@")[0],
                        },
                    });
                }

                return sendSuccess(res, {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    token: data.session.access_token, // Supabase JWT token
                }, "Login successful");
            }
        }

        // Fallback: Local login (without Supabase)
        // In a real scenario, you'd verify password hash here
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return sendError(res, "Invalid credentials", 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: "customer" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        }, "Login successful");
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Login
 * WIP : since we are not using admin login for now, we will not implement this with the user authentication in future.
 */

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw new ValidationError("Username and password are required");
        }

        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin || !admin.isActive) {
            return sendError(res, "Invalid credentials", 401);
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return sendError(res, "Invalid credentials", 401);
        }

        const token = jwt.sign(
            { adminId: admin.id, email: admin.email, type: "admin" },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return sendSuccess(res, {
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                name: admin.name,
            },
            token,
        }, "Admin login successful");
    } catch (error) {
        next(error);
    }
};

// Get User Profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                addresses: {
                    orderBy: { isDefault: "desc" },
                },
            },
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return sendSuccess(res, {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            addresses: user.addresses,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

