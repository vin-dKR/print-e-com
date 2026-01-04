import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase";
import { prisma } from "../services/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, UnauthorizedError, NotFoundError } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Customer Registration
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name, phone, isAdmin, isSuperAdmin } = req.body;

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

            if (data.user && data.session) {
                // Create user in our database
                const user = await prisma.user.create({
                    data: {
                        email,
                        name: name || email.split("@")[0],
                        phone,
                        supabaseId: data.user.id,
                        isAdmin,
                        isSuperAdmin
                    },
                });

                // Auto-login after registration - return token
                return sendSuccess(res, {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    token: data.session.access_token, // Supabase JWT token
                }, "Registration successful", 201);
            } else if (data.user) {
                // User created but no session (email confirmation required)
                const user = await prisma.user.create({
                    data: {
                        email,
                        name: name || email.split("@")[0],
                        phone,
                        supabaseId: data.user.id,
                        isAdmin,
                        isSuperAdmin
                    },
                });

                return sendSuccess(res, {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    // No token if email confirmation is required
                }, "Registration successful. Please check your email to confirm your account.", 201);
            }
        }

        // Fallback: Local registration (without Supabase)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return sendError(res, "User already exists", 400);
        }

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                name: name || email.split("@")[0],
                phone,
                isAdmin,
                isSuperAdmin
            },
        });

        // Auto-login after registration - generate JWT token
        const isAdminUser = user.isAdmin;
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: isAdminUser ? "admin" : "customer" },
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

        const isAdmin = user.isAdmin

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: isAdmin ? "admin" : "customer" },
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
            isAdmin: user.isAdmin,
            addresses: user.addresses,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

