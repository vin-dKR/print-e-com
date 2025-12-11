import { Router, type IRouter } from "express";
import {
    getCategories,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    addVariant,
} from "../controllers/productController";
import {
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
} from "../controllers/orderController";
import { adminAuth } from "../middleware/auth";

const router: IRouter = Router();

// Public product routes
router.get("/categories", getCategories);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);

// Admin protected routes
router.use(adminAuth);

// Product management
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/variants", addVariant);

// Order management
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;

