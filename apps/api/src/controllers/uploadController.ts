import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

// Upload design image
export const uploadDesign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ValidationError("No file uploaded");
        }

        // In production, upload to S3 and return S3 URL
        // For now, return local file path or placeholder
        const fileUrl = process.env.APP_URL
            ? `${process.env.APP_URL}/uploads/designs/${req.file.filename}`
            : `/uploads/designs/${req.file.filename}`;

        return sendSuccess(res, {
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
        }, "File uploaded successfully", 201);
    } catch (error) {
        next(error);
    }
};

