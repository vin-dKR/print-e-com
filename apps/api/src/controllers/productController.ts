import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, NotFoundError } from "../utils/errors";

// Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });

        return sendSuccess(res, categories);
    } catch (error) {
        next(error);
    }
};

// Get all products with pagination and filters
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const category = req.query.category as string;
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
        };

        if (category) {
            const categoryRecord = await prisma.category.findFirst({
                where: {
                    OR: [
                        { slug: category.toLowerCase() },
                        { name: { contains: category, mode: "insensitive" } },
                    ],
                },
            });

            if (categoryRecord) {
                where.categoryId = categoryRecord.id;
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    variants: {
                        where: { available: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.product.count({ where }),
        ]);

        return sendSuccess(res, {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single product
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: {
                    where: { available: true },
                },
            },
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        return sendSuccess(res, product);
    } catch (error) {
        next(error);
    }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, basePrice, categoryId, images } = req.body;

        if (!name || !basePrice || !categoryId) {
            throw new ValidationError("Name, basePrice, and categoryId are required");
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                basePrice: parseFloat(basePrice),
                categoryId,
                images: images || [],
            },
            include: {
                category: true,
                variants: true,
            },
        });

        return sendSuccess(res, product, "Product created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, basePrice, categoryId, images, isActive } = req.body;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (basePrice) updateData.basePrice = parseFloat(basePrice);
        if (categoryId) updateData.categoryId = categoryId;
        if (images) updateData.images = images;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                variants: true,
            },
        });

        return sendSuccess(res, updatedProduct, "Product updated successfully");
    } catch (error) {
        next(error);
    }
};

// Admin: Delete product (soft delete)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });

        return sendSuccess(res, null, "Product deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Admin: Add variant to product
export const addVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, priceModifier, available } = req.body;

        if (!name) {
            throw new ValidationError("Variant name is required");
        }

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const variant = await prisma.productVariant.create({
            data: {
                productId: id,
                name,
                priceModifier: priceModifier ? parseFloat(priceModifier) : 0,
                available: available !== undefined ? available : true,
            },
        });

        return sendSuccess(res, variant, "Variant added successfully", 201);
    } catch (error) {
        next(error);
    }
};

