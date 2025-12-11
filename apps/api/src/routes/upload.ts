import { Router, type IRouter } from "express";
import { uploadDesign } from "../controllers/uploadController";
import { upload } from "../middleware/upload";
import { customerAuth } from "../middleware/auth";

const router: IRouter = Router();

// Protected route
router.post("/upload", customerAuth, upload.single("design"), uploadDesign);

export default router;

