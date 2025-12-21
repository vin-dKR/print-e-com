import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendSuccess } from "../utils/response";
import { ValidationError, NotFoundError } from "../utils/errors";
import { Prisma } from "../../generated/prisma/client";

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

export const createCategoties = async (req: Request, res: Response, next: NextFunction) => {
    const { name, slug, description } = req.body
    console.log("---------", req.body)

    try {
        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description
            }
        })

        return sendSuccess(res, category, "Category created successfully", 200)
    } catch (error) {
        // console.log("hello------------------", error)
        next(error)
    }
}

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
                    brand: true,
                    variants: {
                        where: { available: true },
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
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
                brand: true,
                variants: {
                    where: { available: true },
                },
                images: {
                    orderBy: { displayOrder: "asc" },
                },
                specifications: {
                    orderBy: { displayOrder: "asc" },
                },
                attributes: true,
                tags: true,
                reviews: {
                    where: { isApproved: true },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    take: 5,
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        // Track recently viewed (if user is authenticated)
        if (req.user) {
            await prisma.recentlyViewedProduct.upsert({
                where: {
                    userId_productId: {
                        userId: req.user.id,
                        productId: product.id,
                    },
                },
                update: {
                    viewedAt: new Date(),
                },
                create: {
                    userId: req.user.id,
                    productId: product.id,
                },
            });
        }

        return sendSuccess(res, product);
    } catch (error) {
        next(error);
    }
};

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

// Admin: Create product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            slug,
            description,
            shortDescription,
            basePrice,
            sellingPrice,
            mrp,
            categoryId,
            brandId,
            sku,
            stock,
            minOrderQuantity,
            maxOrderQuantity,
            weight,
            dimensions,
            returnPolicy,
            warranty,
            isFeatured,
            isNewArrival,
            isBestSeller,
            images,
            specifications,
            attributes,
            tags,
        } = req.body;

        if (!name || !basePrice || !categoryId) {
            throw new ValidationError("Name, basePrice, and categoryId are required");
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        // Generate slug if not provided
        let productSlug = slug || generateSlug(name);
        let uniqueSlug = productSlug;
        let counter = 1;

        // Ensure slug is unique
        while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${productSlug}-${counter}`;
            counter++;
        }

        // Create product with images, specifications, attributes, and tags
        const product = await prisma.product.create({
            data: {
                name,
                slug: uniqueSlug,
                description,
                shortDescription,
                basePrice: parseFloat(basePrice),
                sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
                mrp: mrp ? parseFloat(mrp) : null,
                categoryId,
                brandId: brandId || null,
                sku: sku || null,
                stock: stock || 0,
                minOrderQuantity: minOrderQuantity || 1,
                maxOrderQuantity: maxOrderQuantity || null,
                weight: weight ? parseFloat(weight) : null,
                dimensions: dimensions || null,
                returnPolicy: returnPolicy || null,
                warranty: warranty || null,
                isFeatured: isFeatured || false,
                isNewArrival: isNewArrival || false,
                isBestSeller: isBestSeller || false,
                images: images
                    ? {
                          create: images.map((img: any, index: number) => ({
                              url: typeof img === 'string' ? img : img.url,
                              alt: typeof img === 'string' ? null : img.alt,
                              isPrimary: index === 0,
                              displayOrder: index,
                          })),
                      }
                    : undefined,
                specifications: specifications
                    ? {
                          create: specifications.map((spec: any, index: number) => ({
                              key: spec.key,
                              value: spec.value,
                              displayOrder: index,
                          })),
                      }
                    : undefined,
                attributes: attributes
                    ? {
                          create: attributes.map((attr: any) => ({
                              attributeType: attr.type,
                              attributeValue: attr.value,
                          })),
                      }
                    : undefined,
                tags: tags
                    ? {
                          create: tags.map((tag: string) => ({
                              tag,
                          })),
                      }
                    : undefined,
            },
            include: {
                category: true,
                brand: true,
                variants: true,
                images: true,
                specifications: true,
                attributes: true,
                tags: true,
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
        const {
            name,
            slug,
            description,
            shortDescription,
            basePrice,
            sellingPrice,
            mrp,
            categoryId,
            brandId,
            sku,
            stock,
            minOrderQuantity,
            maxOrderQuantity,
            weight,
            dimensions,
            returnPolicy,
            warranty,
            isActive,
            isFeatured,
            isNewArrival,
            isBestSeller,
            images,
            specifications,
            attributes,
            tags,
        } = req.body;

        if(!id) {
            throw new ValidationError("Pprovide the id to update")
        }
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (slug) {
            // Ensure slug is unique
            let uniqueSlug = slug;
            let counter = 1;
            while (
                await prisma.product.findFirst({
                    where: { slug: uniqueSlug, id: { not: id } },
                })
            ) {
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }
            updateData.slug = uniqueSlug;
        }
        if (description !== undefined) updateData.description = description;
        if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
        if (basePrice) updateData.basePrice = parseFloat(basePrice);
        if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice ? parseFloat(sellingPrice) : null;
        if (mrp !== undefined) updateData.mrp = mrp ? parseFloat(mrp) : null;
        if (categoryId) updateData.categoryId = categoryId;
        if (brandId !== undefined) updateData.brandId = brandId || null;
        if (sku !== undefined) updateData.sku = sku || null;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (minOrderQuantity !== undefined) updateData.minOrderQuantity = parseInt(minOrderQuantity);
        if (maxOrderQuantity !== undefined) updateData.maxOrderQuantity = maxOrderQuantity ? parseInt(maxOrderQuantity) : null;
        if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
        if (dimensions !== undefined) updateData.dimensions = dimensions || null;
        if (returnPolicy !== undefined) updateData.returnPolicy = returnPolicy || null;
        if (warranty !== undefined) updateData.warranty = warranty || null;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival;
        if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                brand: true,
                variants: true,
                images: true,
                specifications: true,
                attributes: true,
                tags: true,
            },
        });

        // Update images if provided
        if (images && Array.isArray(images)) {
            await prisma.productImage.deleteMany({ where: { productId: id } });
            await prisma.productImage.createMany({
                data: images.map((img: any, index: number) => ({
                    productId: id,
                    url: typeof img === 'string' ? img : img.url,
                    alt: typeof img === 'string' ? null : img.alt,
                    isPrimary: index === 0,
                    displayOrder: index,
                })),
            });
        }

        // Update specifications if provided
        if (specifications && Array.isArray(specifications)) {
            await prisma.productSpecification.deleteMany({ where: { productId: id } });
            await prisma.productSpecification.createMany({
                data: specifications.map((spec: any, index: number) => ({
                    productId: id,
                    key: spec.key,
                    value: spec.value,
                    displayOrder: index,
                })),
            });
        }

        // Update attributes if provided
        if (attributes && Array.isArray(attributes)) {
            await prisma.productAttribute.deleteMany({ where: { productId: id } });
            await prisma.productAttribute.createMany({
                data: attributes.map((attr: any) => ({
                    productId: id,
                    attributeType: attr.type,
                    attributeValue: attr.value,
                })),
            });
        }

        // Update tags if provided
        if (tags && Array.isArray(tags)) {
            await prisma.productTag.deleteMany({ where: { productId: id } });
            await prisma.productTag.createMany({
                data: tags.map((tag: string) => ({
                    productId: id,
                    tag,
                })),
            });
        }

        // Fetch updated product with all relations
        const finalProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                variants: true,
                images: true,
                specifications: true,
                attributes: true,
                tags: true,
            },
        });

        return sendSuccess(res, finalProduct, "Product updated successfully");
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

        if (!id) {
            throw new ValidationError("There is not id passed in the params")
        }

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


export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name = "",
            page = "1",
            limit = "10"
        } = req.query as {
            name?: string;
            page?: string;
            limit?: string;
        }

        if (name.trim().length < 3) {
            throw new ValidationError("please name with atleast 3 characters")
        }

        const pageNumber = Number(page)
        const limitNumber = Number(limit)

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            throw new ValidationError("Page and limit must be number")
        }

        const skip = (pageNumber - 1) * limitNumber

        const where: Prisma.ProductWhereInput = {
            OR: [
                { id: { contains: name } },
                { name: { contains: name, mode: "insensitive" } },
                { description: { contains: name, mode: "insensitive" } },
                { categoryId: { contains: name } }
            ]
        }

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where: where,
                skip,
                take: limitNumber,
                orderBy: { name: "asc" }
            }),
            prisma.product.count({ where })
        ])

        const data = {
            products,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limitNumber),
            },
        }

        return sendSuccess(
            res,
            data,
            "Data fetched successfully",
            200
        )
    } catch (error) {
        next(error)
    }
}
