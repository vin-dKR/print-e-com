import { Router, type IRouter } from "express";
import {
    register,
    login,
    adminLogin,
    getProfile,
} from "../controllers/authController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

/**
 * Admin Login
 * WIP : since we are not using admin login for now, we will not implement this with the user authentication in future.
 */
router.post("/admin/login", adminLogin);

// Protected routes
router.get("/user/profile", customerAuth, getProfile);

export default router;
