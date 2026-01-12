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

// Upload review images (customer)
export const uploadReviewImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files) {
            throw new ValidationError("No files uploaded");
        }

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        const userId = req.user.id;
        const productId = req.body.productId as string | undefined;

        // Validate product exists if productId is provided
        if (productId) {
            const product = await prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new NotFoundError("Product not found");
            }
        }

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

        // Validate file count (max 5 images per review)
        if (files.length > 5) {
            throw new ValidationError("Maximum 5 images allowed per review");
        }

        // Validate file types (only images)
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const maxFileSize = 5 * 1024 * 1024; // 5MB

        for (const file of files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new ValidationError(
                    `Invalid file type: ${file.mimetype}. Only JPG, PNG, and WebP images are allowed.`
                );
            }
            if (file.size > maxFileSize) {
                throw new ValidationError(
                    `File ${file.originalname} is too large. Maximum file size is 5MB.`
                );
            }
        }

        // Upload to S3 in reviews folder
        const subfolder = productId ? `${userId}/${productId}` : `${userId}/temp`;
        const uploadResults = await Promise.all(
            files.map(async (file, index) => {
                const filename = generateFilename(file.originalname, "review");
                const timestamp = Date.now();
                const key = await uploadToS3(
                    file,
                    "images", // Use images folder for review images (public access)
                    `reviews/${subfolder}`,
                    `${timestamp}-${index}-${filename}`,
                    true // Public file so review images can be displayed directly
                );

                // Get public URL (since images are public)
                const publicUrl = getPublicUrl(key);

                return {
                    key,
                    url: publicUrl,
                    filename: `${timestamp}-${index}-${filename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                };
            })
        );

        return sendSuccess(res, {
            files: uploadResults,
        }, "Review images uploaded successfully", 201);
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

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        // Generate presigned URL (valid for 1 hour)
        const presignedUrl = await generatePresignedUrl(fileKey, 3600);

        return sendSuccess(res, {
            url: presignedUrl,
        }, "File URL generated successfully");
    } catch (error) {
        next(error);
    }
};

// Delete order file
export const deleteOrderFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileKey } = req.params;

        if (!fileKey) {
            throw new ValidationError("File key is required");
        }

        if (!req.user || req.user.type !== "customer") {
            throw new ValidationError("Customer authentication required");
        }

        // Delete from S3
        await deleteFromS3(fileKey);

        return sendSuccess(res, null, "File deleted successfully");
    } catch (error) {
        next(error);
    }
};

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
        const presignedUrls = await Promise.all(
            uploadedKeys.map(async (key) => {
                return await generatePresignedUrl(key, 3600 * 24 * 365); // 1 year
            })
        );

        await prisma.orderItem.update({
            where: { id: matchingItem.id },
            data: {
                customDesignUrl: presignedUrls,
            },
        });

        return sendSuccess(res, {
            files: uploadResults,
            orderItemId: matchingItem.id,
        }, "Files uploaded and linked to order successfully", 201);
    } catch (error) {
        next(error);
    }
};
