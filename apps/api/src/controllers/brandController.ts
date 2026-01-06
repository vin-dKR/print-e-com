import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Admin: Get all brands
 */
export const getAdminBrands = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brands = await prisma.brand.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return sendSuccess(res, brands);
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get single brand
 */
export const getAdminBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Brand ID is required");
        }

        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        basePrice: true,
                        isActive: true,
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!brand) {
            throw new NotFoundError("Brand not found");
        }

        return sendSuccess(res, brand);
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Create brand
 */
export const createAdminBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, slug, logo, description, website, isActive } = req.body;

        if (!name) {
            throw new ValidationError("Brand name is required");
        }

        // Generate slug if not provided
        const brandSlug = slug || generateSlug(name);

        // Check if slug already exists
        const existingBrand = await prisma.brand.findUnique({
            where: { slug: brandSlug },
        });

        if (existingBrand) {
            throw new ValidationError("Brand with this slug already exists");
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                slug: brandSlug,
                logo,
                description,
                website,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return sendSuccess(res, brand, "Brand created successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Update brand
 */
export const updateAdminBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, slug, logo, description, website, isActive } = req.body;

        if (!id) {
            throw new ValidationError("Brand ID is required");
        }

        const existingBrand = await prisma.brand.findUnique({
            where: { id },
        });

        if (!existingBrand) {
            throw new NotFoundError("Brand not found");
        }

        const updateData: any = {};
        if (name !== undefined) {
            updateData.name = name;
            // Regenerate slug if name changed and slug not provided
            if (!slug) {
                updateData.slug = generateSlug(name);
            }
        }
        if (slug !== undefined) {
            // Check if new slug conflicts with another brand
            const slugConflict = await prisma.brand.findUnique({
                where: { slug },
            });
            if (slugConflict && slugConflict.id !== id) {
                throw new ValidationError("Brand with this slug already exists");
            }
            updateData.slug = slug;
        }
        if (logo !== undefined) updateData.logo = logo;
        if (description !== undefined) updateData.description = description;
        if (website !== undefined) updateData.website = website;
        if (isActive !== undefined) updateData.isActive = isActive;

        const brand = await prisma.brand.update({
            where: { id },
            data: updateData,
        });

        return sendSuccess(res, brand, "Brand updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Delete brand
 */
export const deleteAdminBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Brand ID is required");
        }

        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!brand) {
            throw new NotFoundError("Brand not found");
        }

        // Check if brand has products
        if (brand._count.products > 0) {
            throw new ValidationError("Cannot delete brand with associated products");
        }

        await prisma.brand.delete({
            where: { id },
        });

        return sendSuccess(res, null, "Brand deleted successfully");
    } catch (error) {
        next(error);
    }
};

