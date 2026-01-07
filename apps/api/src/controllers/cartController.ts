import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

// Get user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                images: true,
                            },
                        },
                        variant: true,
                    },
                },
            },
        });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                    images: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
        }

        // Calculate totals
        let subtotal = 0;
        cart.items.forEach((item) => {
            const productPrice = Number(item.product.basePrice);
            const variantPrice = item.variant ? Number(item.variant.priceModifier) : 0;
            const itemPrice = (productPrice + variantPrice) * item.quantity;
            subtotal += itemPrice;
        });

        return sendSuccess(res, {
            cart,
            subtotal,
            itemCount: cart.items.length,
        });
    } catch (error) {
        next(error);
    }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { productId, variantId, quantity = 1, customDesignUrl, customText } = req.body;

        if (!productId) {
            throw new ValidationError("Product ID is required");
        }

        if (quantity < 1) {
            throw new ValidationError("Quantity must be at least 1");
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true },
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        // Check stock
        if (product.stock < quantity) {
            throw new ValidationError("Insufficient stock");
        }

        // Verify variant if provided
        if (variantId) {
            const variant = product.variants.find((v) => v.id === variantId);
            if (!variant || !variant.available) {
                throw new NotFoundError("Variant not found or unavailable");
            }
            if (variant.stock < quantity) {
                throw new ValidationError("Insufficient variant stock");
            }
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id },
            });
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId_variantId: {
                    cartId: cart.id,
                    productId,
                    variantId: variantId || "",
                },
            },
        });

        let cartItem;
        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                    customDesignUrl: customDesignUrl || existingItem.customDesignUrl,
                    customText: customText || existingItem.customText,
                },
                include: {
                    product: {
                        include: {
                            category: true,
                            images: true,
                        },
                    },
                    variant: true,
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    variantId: variantId || null,
                    quantity,
                    customDesignUrl: customDesignUrl || null,
                    customText: customText || null,
                },
                include: {
                    product: {
                        include: {
                            category: true,
                            images: true,
                        },
                    },
                    variant: true,
                },
            });
        }

        return sendSuccess(res, cartItem, "Item added to cart successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { itemId } = req.params;
        const { quantity, customDesignUrl, customText } = req.body;

        if (!quantity || quantity < 1) {
            throw new ValidationError("Quantity must be at least 1");
        }

        // Verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
                variant: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundError("Cart item not found");
        }

        if (cartItem.cart.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to update this cart item");
        }

        // Check stock
        const stock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
        if (stock < quantity) {
            throw new ValidationError("Insufficient stock");
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: {
                quantity,
                customDesignUrl: customDesignUrl !== undefined ? customDesignUrl : cartItem.customDesignUrl,
                customText: customText !== undefined ? customText : cartItem.customText,
            },
            include: {
                product: {
                    include: {
                        category: true,
                        images: true,
                    },
                },
                variant: true,
            },
        });

        return sendSuccess(res, updatedItem, "Cart item updated successfully");
    } catch (error) {
        next(error);
    }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { itemId } = req.params;

        // Verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!cartItem) {
            throw new NotFoundError("Cart item not found");
        }

        if (cartItem.cart.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to remove this cart item");
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        return sendSuccess(res, null, "Item removed from cart successfully");
    } catch (error) {
        next(error);
    }
};

// Clear cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        return sendSuccess(res, null, "Cart cleared successfully");
    } catch (error) {
        next(error);
    }
};

