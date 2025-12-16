import { Router, type IRouter } from "express";
import {
    register,
    login,
    getProfile,
} from "../controllers/authController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/user/profile", customerAuth, getProfile);

export default router;
