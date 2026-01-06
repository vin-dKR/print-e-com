import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all customer users
 *     description: Admin can view and manage all customer users (non-admin users only) with pagination and search.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: List of customer users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   required:
 *                     - items
 *                     - pagination
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: "customer@example.com"
 *                           name:
 *                             type: string
 *                             nullable: true
 *                             example: "John Doe"
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                             example: "+1234567890"
 *                           isAdmin:
 *                             type: boolean
 *                             example: false
 *                           isSuperAdmin:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized - Admin authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 */
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || "";
        const skip = (page - 1) * limit;

        const where: any = {
            isAdmin: false,
            isSuperAdmin: false,
        };

        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    isAdmin: true,
                    isSuperAdmin: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return sendSuccess(res, {
            items: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get single customer user by ID
 *     description: Admin can view detailed information about a specific customer user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer user ID
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Customer user details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     isAdmin:
 *                       type: boolean
 *                     isSuperAdmin:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     addresses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           street:
 *                             type: string
 *                           city:
 *                             type: string
 *                           state:
 *                             type: string
 *                           zipCode:
 *                             type: string
 *                           country:
 *                             type: string
 *                           isDefault:
 *                             type: boolean
 *                     _count:
 *                       type: object
 *                       properties:
 *                         orders:
 *                           type: integer
 *                         reviews:
 *                           type: integer
 *       404:
 *         description: Customer user not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
export const getAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("User ID is required");
        }

        const user = await prisma.user.findFirst({
            where: {
                id,
                isAdmin: false,
                isSuperAdmin: false,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isAdmin: true,
                isSuperAdmin: true,
                createdAt: true,
                updatedAt: true,
                addresses: {
                    select: {
                        id: true,
                        street: true,
                        city: true,
                        state: true,
                        zipCode: true,
                        country: true,
                        isDefault: true,
                    },
                },
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError("Customer user not found");
        }

        return sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update customer user
 *     description: Admin can update customer user information (name and phone only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer user ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Customer user updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Customer user updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     isAdmin:
 *                       type: boolean
 *                     isSuperAdmin:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Customer user not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
export const updateAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        if (!id) {
            throw new ValidationError("User ID is required");
        }

        // Check if user exists and is a customer (not admin)
        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                isAdmin: false,
                isSuperAdmin: false,
            },
        });

        if (!existingUser) {
            throw new NotFoundError("Customer user not found");
        }

        // Prepare update data (admin cannot change isAdmin/isSuperAdmin through this endpoint)
        const updateData: {
            name?: string;
            phone?: string;
        } = {};

        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                isAdmin: true,
                isSuperAdmin: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return sendSuccess(res, user, "Customer user updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete customer user
 *     description: Admin can delete customer users (cascade deletes related records)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer user deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Customer user deleted successfully"
 *                 data:
 *                   type: null
 *       404:
 *         description: Customer user not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("User ID is required");
        }

        // Check if user exists and is a customer (not admin)
        const user = await prisma.user.findFirst({
            where: {
                id,
                isAdmin: false,
                isSuperAdmin: false,
            },
        });

        if (!user) {
            throw new NotFoundError("Customer user not found");
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id },
        });

        return sendSuccess(res, null, "Customer user deleted successfully");
    } catch (error) {
        next(error);
    }
};

