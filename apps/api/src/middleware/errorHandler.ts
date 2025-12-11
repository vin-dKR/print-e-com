import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { AppError } from "../utils/errors";

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode);
    }

    console.error("Unhandled error:", err);
    return sendError(res, "Internal server error", 500);
};

