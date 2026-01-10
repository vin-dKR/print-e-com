import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { uploadToS3, deleteFromS3, getPublicUrl, generatePresignedUrl, generateFilename, extractKeyFromUrl } from "../services/s3.js";
import { prisma } from "../services/prisma.js";
import { randomUUID } from "crypto";

// Upload design/order file (customer)
export const uploadDesign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ValidationError("No file uploaded");
        }

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        const userId = req.user.id;
        const sessionId = req.body.sessionId || randomUUID();
        const productId = req.body.productId || null;

        // Generate filename
        const filename = generateFilename(req.file.originalname, "design");

        // Upload to S3 temp folder
        const subfolder = `${userId}/temp`;
        const key = await uploadToS3(
            req.file,
            "orders-file",
            subfolder,
            `${sessionId}-${filename}`,
            false // Private file
        );

        // Generate presigned URL for immediate access
        const presignedUrl = await generatePresignedUrl(key, 3600); // 1 hour

        // Extract page count if PDF (optional - would need pdf-lib or similar)
        let pageCount = null;
        if (req.file.mimetype === "application/pdf") {
            // TODO: Extract PDF page count if needed
            // pageCount = await extractPdfPageCount(req.file.buffer);
        }

        return sendSuccess(res, {
            key,
            url: presignedUrl,
            filename: `${sessionId}-${filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            pageCount,
            sessionId,
        }, "File uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Upload multiple order files
export const uploadOrderFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files) {
            throw new ValidationError("No files uploaded");
        }

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        const userId = req.user.id;
        const sessionId = (req.body.sessionId as string) || randomUUID();

        // Handle both single file array and multiple files
        let files: Express.Multer.File[] = [];
        if (Array.isArray(req.files)) {
            files = req.files;
        } else if (typeof req.files === "object") {
            // Handle fieldname-based file object
            files = Object.values(req.files).flat();
        }

        if (files.length === 0) {
            throw new ValidationError("No files uploaded");
        }

        const subfolder = `${userId}/temp`;

        const uploadResults = await Promise.all(
            files.map(async (file) => {
                const filename = generateFilename(file.originalname, "design");
                const key = await uploadToS3(
                    file,
                    "orders-file",
                    subfolder,
                    `${sessionId}-${filename}`,
                    false
                );

                const presignedUrl = await generatePresignedUrl(key, 3600);

                return {
                    key,
                    url: presignedUrl,
                    filename: `${sessionId}-${filename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                };
            })
        );

        return sendSuccess(res, {
            files: uploadResults,
            sessionId,
        }, "Files uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Get order file (presigned URL)
export const getOrderFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileKey } = req.params;

        if (!fileKey) {
            throw new ValidationError("File key is required");
        }

        if (!req.user) {
            throw new ValidationError("Authentication required");
        }

        // Verify file belongs to user (for customers) or allow admin access
        const key = fileKey.startsWith("orders-file/") ? fileKey : `orders-file/${fileKey}`;

        if (req.user.type === "customer") {
            // Verify the file is in the user's folder
            if (!key.includes(`/${req.user.id}/`)) {
                throw new ValidationError("Access denied");
            }
        }

        const expiresIn = parseInt(req.query.expiresIn as string) || 3600;
        const presignedUrl = await generatePresignedUrl(key, expiresIn);

        return sendSuccess(res, {
            presignedUrl,
            expiresIn,
        }, "Presigned URL generated successfully");
    } catch (error) {
        next(error);
    }
};

// Delete order file
// Upload files for order after order confirmation (called from frontend after payment success)
export const uploadOrderFilesAfterConfirmation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            throw new ValidationError("No files uploaded");
        }

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        const orderId = req.params.orderId;
        const orderItemId = req.body.orderItemId as string | undefined;
        const productId = req.body.productId as string | undefined;
        const variantId = req.body.variantId as string | undefined;

        if (!orderId) {
            throw new ValidationError("Order ID is required");
        }

        if (!productId) {
            throw new ValidationError("Product ID is required for matching order item");
        }

        // Verify order exists, belongs to user, and payment is successful
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: req.user.id,
                paymentStatus: "SUCCESS",
            },
            include: {
                items: true,
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found, access denied, or payment not confirmed");
        }

        const userId = req.user.id;

        // Handle both single file array and multiple files
        let files: Express.Multer.File[] = [];
        if (Array.isArray(req.files)) {
            files = req.files;
        } else if (typeof req.files === "object") {
            files = Object.values(req.files).flat();
        }

        if (files.length === 0) {
            throw new ValidationError("No files uploaded");
        }

        // Upload files to final order location: orders-file/{userId}/{orderId}/
        const subfolder = `${userId}/${orderId}`;
        const uploadResults = await Promise.all(
            files.map(async (file, index) => {
                const filename = generateFilename(file.originalname, "order");
                const finalFilename = `${Date.now()}-${index}-${filename}`;

                const key = await uploadToS3(
                    file,
                    "orders-file",
                    subfolder,
                    finalFilename,
                    false // Private file
                );

                return {
                    key,
                    filename: finalFilename,
                    size: file.size,
                    mimetype: file.mimetype,
                };
            })
        );

        // Extract S3 keys from upload results
        const uploadedKeys = uploadResults.map(result => result.key);

        if (uploadedKeys.length === 0) {
            throw new ValidationError("Failed to upload files");
        }

        // Find matching order item by productId and variantId
        let matchingItem = order.items.find(item => {
            const productMatch = item.productId === productId;
            const variantMatch = variantId
                ? item.variantId === variantId
                : item.variantId === null;
            return productMatch && variantMatch;
        });

        // If orderItemId is specified, use that instead
        if (orderItemId) {
            const itemById = order.items.find(item => item.id === orderItemId);
            if (itemById) {
                matchingItem = itemById;
            }
        }

        if (!matchingItem) {
            throw new NotFoundError(
                `Order item not found for product ${productId}, variant ${variantId || 'none'}`
            );
        }

        // Update order item with S3 URLs (replace existing array with new URLs)
        const existingUrls = Array.isArray(matchingItem.customDesignUrl)
            ? matchingItem.customDesignUrl
            : [];
        const updatedUrls = [...existingUrls, ...uploadedKeys];

        await prisma.orderItem.update({
            where: { id: matchingItem.id },
            data: { customDesignUrl: updatedUrls },
        });

        // Fetch updated order item to return in response
        const updatedItem = await prisma.orderItem.findUnique({
            where: { id: matchingItem.id },
            select: {
                id: true,
                productId: true,
                variantId: true,
                customDesignUrl: true,
            },
        });

        return sendSuccess(res, {
            orderId,
            uploadedFiles: uploadResults,
            updatedItems: updatedItem ? [{
                orderItemId: updatedItem.id,
                productId: updatedItem.productId,
                variantId: updatedItem.variantId,
                s3Key: uploadedKeys.length === 1 ? uploadedKeys[0] : uploadedKeys,
                s3Urls: uploadedKeys,
            }] : [],
            uploadedFilesCount: files.length,
        }, "Files uploaded and order items updated successfully", 201);
    } catch (error) {
        next(error);
    }
};

export const deleteOrderFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileKey } = req.params;

        if (!fileKey) {
            throw new ValidationError("File key is required");
        }

        if (!req.user) {
            throw new ValidationError("Authentication required");
        }

        const key = fileKey.startsWith("orders-file/") ? fileKey : `orders-file/${fileKey}`;

        // Verify file belongs to user (for customers) or allow admin access
        if (req.user.type === "customer") {
            if (!key.includes(`/${req.user.id}/`)) {
                throw new ValidationError("Access denied");
            }
        }

        await deleteFromS3(key);

        return sendSuccess(res, null, "File deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Upload product image (admin)
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ValidationError("No file uploaded");
        }

        if (!req.user || req.user.type !== "admin") {
            throw new ValidationError("Admin authentication required");
        }

        const productId = req.body.productId || "temp";
        const isPrimary = req.body.isPrimary === "true" || req.body.isPrimary === true;
        const prefix = isPrimary ? "primary" : "image";

        // Generate filename
        const filename = generateFilename(req.file.originalname, prefix);

        // Upload to S3
        const subfolder = `products/${productId}`;
        const key = await uploadToS3(
            req.file,
            "images",
            subfolder,
            filename,
            true // Public file
        );

        const url = getPublicUrl(key);

        // If productId is not "temp", save to database
        let imageRecord = null;
        if (productId !== "temp") {
            // Unset other primary images if this is primary
            if (isPrimary) {
                await prisma.productImage.updateMany({
                    where: { productId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }

            // Get max display order
            const maxOrder = await prisma.productImage.findFirst({
                where: { productId },
                orderBy: { displayOrder: "desc" },
                select: { displayOrder: true },
            });
            const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;

            imageRecord = await prisma.productImage.create({
                data: {
                    productId,
                    url,
                    alt: req.body.alt || null,
                    isPrimary,
                    displayOrder,
                },
            });
        }

        return sendSuccess(res, {
            url,
            key,
            filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            image: imageRecord,
        }, "Image uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Upload multiple product images
export const uploadProductImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files) {
            throw new ValidationError("No files uploaded");
        }

        if (!req.user || req.user.type !== "admin") {
            throw new ValidationError("Admin authentication required");
        }

        const productId = (req.body.productId as string) || "temp";

        // Handle both single file array and multiple files
        let files: Express.Multer.File[] = [];
        if (Array.isArray(req.files)) {
            files = req.files;
        } else if (typeof req.files === "object") {
            // Handle fieldname-based file object
            files = Object.values(req.files).flat();
        }

        if (files.length === 0) {
            throw new ValidationError("No files uploaded");
        }

        const subfolder = `products/${productId}`;

        const uploadResults = await Promise.all(
            files.map(async (file, index) => {
                const isPrimary = index === 0;
                const prefix = isPrimary ? "primary" : "image";
                const filename = generateFilename(file.originalname, prefix);

                const key = await uploadToS3(
                    file,
                    "images",
                    subfolder,
                    filename,
                    true
                );

                const url = getPublicUrl(key);

                return {
                    url,
                    key,
                    filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    isPrimary,
                    displayOrder: index,
                };
            })
        );

        // Save to database if productId is not "temp"
        let imageRecords = null;
        if (productId !== "temp") {
            // Unset existing primary images
            await prisma.productImage.updateMany({
                where: { productId, isPrimary: true },
                data: { isPrimary: false },
            });

            imageRecords = await prisma.productImage.createMany({
                data: uploadResults.map((result, index) => ({
                    productId,
                    url: result.url,
                    alt: null,
                    isPrimary: index === 0,
                    displayOrder: index,
                })),
            });
        }

        return sendSuccess(res, {
            images: uploadResults,
            records: imageRecords,
        }, "Images uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Delete product image
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { imageId } = req.params;

        if (!req.user || req.user.type !== "admin") {
            throw new ValidationError("Admin authentication required");
        }

        const image = await prisma.productImage.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            throw new NotFoundError("Image not found");
        }

        // Extract S3 key from URL
        const key = extractKeyFromUrl(image.url);

        // Delete from S3 if key is found
        if (key) {
            try {
                await deleteFromS3(key);
            } catch (s3Error) {
                console.error("Failed to delete from S3:", s3Error);
                // Continue with database deletion even if S3 deletion fails
            }
        }

        // Delete from database
        await prisma.productImage.delete({
            where: { id: imageId },
        });

        return sendSuccess(res, null, "Image deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Upload category image (admin)
export const uploadCategoryImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ValidationError("No file uploaded");
        }

        if (!req.user || req.user.type !== "admin") {
            throw new ValidationError("Admin authentication required");
        }

        const categoryId = req.body.categoryId || req.params.categoryId || "temp";
        const isPrimary = req.body.isPrimary === "true" || req.body.isPrimary === true;
        const prefix = isPrimary ? "primary" : "image";

        // Generate filename
        const filename = generateFilename(req.file.originalname, prefix);

        // Upload to S3
        const subfolder = `categories/${categoryId}`;
        const key = await uploadToS3(
            req.file,
            "images",
            subfolder,
            filename,
            true // Public file
        );

        const url = getPublicUrl(key);

        // If categoryId is not "temp", save to database
        let imageRecord = null;
        if (categoryId !== "temp") {
            // Unset other primary images if this is primary
            if (isPrimary) {
                await prisma.categoryImage.updateMany({
                    where: { categoryId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }

            // Get max display order
            const maxOrder = await prisma.categoryImage.findFirst({
                where: { categoryId },
                orderBy: { displayOrder: "desc" },
                select: { displayOrder: true },
            });
            const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;

            imageRecord = await prisma.categoryImage.create({
                data: {
                    categoryId,
                    url,
                    alt: req.body.alt || null,
                    isPrimary,
                    displayOrder,
                },
            });
        }

        return sendSuccess(res, {
            url,
            key,
            filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            image: imageRecord,
        }, "Image uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Delete category image
export const deleteCategoryImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { imageId } = req.params;

        if (!req.user || req.user.type !== "admin") {
            throw new ValidationError("Admin authentication required");
        }

        const image = await prisma.categoryImage.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            throw new NotFoundError("Image not found");
        }

        // Extract S3 key from URL
        const key = extractKeyFromUrl(image.url);

        // Delete from S3 if key is found
        if (key) {
            try {
                await deleteFromS3(key);
            } catch (s3Error) {
                console.error("Failed to delete from S3:", s3Error);
                // Continue with database deletion even if S3 deletion fails
            }
        }

        // Delete from database
        await prisma.categoryImage.delete({
            where: { id: imageId },
        });

        return sendSuccess(res, null, "Image deleted successfully");
    } catch (error) {
        next(error);
    }
};

