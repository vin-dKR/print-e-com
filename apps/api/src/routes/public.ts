import { Router, type IRouter } from "express";
import {
    getCategories,
    getProducts,
    getProduct,
    searchProducts,
} from "../controllers/productController.js";
import {
    getCategoryBySlug,
    calculateCategoryPricePublic,
    getProductsBySpecifications,
} from "../controllers/categoryController.js";

const router: IRouter = Router();

/**
 * Public Product Catalog Routes
 * These routes are accessible to both customers and admins (no authentication required)
 * Used for browsing products and categories
 */
router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.get("/categories/:slug/products", getProductsBySpecifications);
router.post("/categories/:slug/calculate-price", calculateCategoryPricePublic);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.get("/search", searchProducts);

export default router;

