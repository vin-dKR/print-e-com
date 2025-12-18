import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { sendError, sendSuccess } from "../utils/response";

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, street, city, state, zipCode, country } = req.body
        const user = req.user

        console.log(user)

        if (user?.id !== userId) {
            return sendError(res, "This token is not authorized with this user", 400)
        }
        const address = await prisma.address.create({
            data: {
                userId,
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
