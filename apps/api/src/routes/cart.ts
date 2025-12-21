import { Router, type IRouter } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cartController";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

/**
 * Cart Routes
 * All routes require customer authentication
 */
router.use(customerAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;

