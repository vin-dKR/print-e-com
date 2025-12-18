import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendError, sendSuccess } from "../utils/response";
import { UnauthorizedError } from "../utils/errors";

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return new UnauthorizedError("User not authorized")
        const { street, city, state, zipCode, country } = req.body

        const address = await prisma.address.create({
            data: {
                userId: req.user.id,
                street,
                city,
                state,
                zipCode,
                country
            }
        })

        if (!address) return sendError(res, "Address not create, please try again", 500)

        return sendSuccess(res, address, "Address created Successfully", 200)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
