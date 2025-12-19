import express from "express";
import { updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.put("/profile", uploadMiddleware.single("avatar"), updateUserProfile);

export default router;
