import { Router, type IRouter } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    addVariant,
    createCategoties,
    getAdminCategories,
    getAdminProducts,
    getAdminProduct,
} from "../controllers/productController.js";
import {
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { adminAuth } from "../middleware/auth.js";
import { deleteAdminUser, getAdminUser, getAdminUsers, updateAdminUser } from "../controllers/userController.js";
import { getAdminCoupon, getAdminCoupons } from "../controllers/couponController.js";
import { createAdminCoupon } from "../controllers/couponController.js";
import { updateAdminCoupon } from "../controllers/couponController.js";
import { deleteAdminCoupon } from "../controllers/couponController.js";
import { getAdminPayment, getAdminPayments } from "../controllers/paymentController.js";
import { deleteAdminReview, getAdminReviews } from "../controllers/reviewController.js";
import { getAdminReview } from "../controllers/reviewController.js";
import { updateAdminReview } from "../controllers/reviewController.js";
import { deleteAdminBrand, getAdminBrands } from "../controllers/brandController.js";
import { getAdminBrand } from "../controllers/brandController.js";
import { createAdminBrand } from "../controllers/brandController.js";
import { updateAdminBrand } from "../controllers/brandController.js";
import {
    getCategorySpecifications,
    createCategorySpecification,
    updateCategorySpecification,
    deleteCategorySpecification,
    getSpecificationOptions,
    createSpecificationOption,
    updateSpecificationOption,
    deleteSpecificationOption,
    getCategoryPricingRules,
    createCategoryPricingRule,
    updateCategoryPricingRule,
    deleteCategoryPricingRule,
    calculateCategoryPrice,
    getCategoryConfiguration,
    upsertCategoryConfiguration,
    getCategoryImages,
    createCategoryImage,
    updateCategoryImage,
    deleteCategoryImage,
    previewProductFromPricingRule,
    publishPricingRuleAsProduct,
} from "../controllers/categoryController.js";

const router: IRouter = Router();

/**
 * Admin Management Routes
 * All routes require admin authentication
 * These routes are for managing products, categories, and orders
 */
router.use(adminAuth);

// Product & Category Management (admin only)
router.get("/categories", getAdminCategories);
router.post("/categories", createCategoties);

// Admin Products
router.get("/products", getAdminProducts);
router.get("/products/:id", getAdminProduct);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/variants", addVariant);

// Order Management (admin only)
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.patch("/orders/:id/status", updateOrderStatus);

// Customer User Management (admin only - manages customer users only)
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUser);
router.put("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);

// Coupon Management (admin only)
router.get("/coupons", getAdminCoupons);
router.get("/coupons/:id", getAdminCoupon);
router.post("/coupons", createAdminCoupon);
router.put("/coupons/:id", updateAdminCoupon);
router.delete("/coupons/:id", deleteAdminCoupon);

// Payment Management (admin only)
router.get("/payments", getAdminPayments);
router.get("/payments/:id", getAdminPayment);

// Review Management (admin only)
router.get("/reviews", getAdminReviews);
router.get("/reviews/:id", getAdminReview);
router.put("/reviews/:id", updateAdminReview);
router.delete("/reviews/:id", deleteAdminReview);

// Brand Management (admin only)
router.get("/brands", getAdminBrands);
router.get("/brands/:id", getAdminBrand);
router.post("/brands", createAdminBrand);
router.put("/brands/:id", updateAdminBrand);
router.delete("/brands/:id", deleteAdminBrand);

// Category Specifications Management (admin only)
router.get("/categories/:id/specifications", getCategorySpecifications);
router.post("/categories/:id/specifications", createCategorySpecification);
router.put("/categories/:id/specifications/:specId", updateCategorySpecification);
router.delete("/categories/:id/specifications/:specId", deleteCategorySpecification);

// Specification Options Management (admin only)
router.get("/categories/:id/specifications/:specId/options", getSpecificationOptions);
router.post("/categories/:id/specifications/:specId/options", createSpecificationOption);
router.put("/categories/:id/specifications/:specId/options/:optionId", updateSpecificationOption);
router.delete("/categories/:id/specifications/:specId/options/:optionId", deleteSpecificationOption);

// Category Pricing Rules Management (admin only)
router.get("/categories/:id/pricing", getCategoryPricingRules);
router.post("/categories/:id/pricing", createCategoryPricingRule);
router.put("/categories/:id/pricing/:ruleId", updateCategoryPricingRule);
router.delete("/categories/:id/pricing/:ruleId", deleteCategoryPricingRule);
router.post("/categories/:id/pricing/calculate", calculateCategoryPrice);

// Category Configuration Management (admin only)
router.get("/categories/:id/configuration", getCategoryConfiguration);
router.put("/categories/:id/configuration", upsertCategoryConfiguration);

// Category Images Management (admin only)
router.get("/categories/:id/images", getCategoryImages);
router.post("/categories/:id/images", createCategoryImage);
router.put("/categories/:id/images/:imageId", updateCategoryImage);
router.delete("/categories/:id/images/:imageId", deleteCategoryImage);

// Publish Pricing Rule as Product (admin only)
router.get("/categories/:categoryId/pricing-rules/:ruleId/preview-product", previewProductFromPricingRule);
router.post("/categories/:categoryId/pricing-rules/:ruleId/publish", publishPricingRuleAsProduct);

export default router;
