import express from "express";
import {
  getPrebuiltSessions,
  getUserSessions,
  getSessionById,
  createSession,
  updateSessionData,
  updateUserProgress,
  deleteSession,
  toggleFavorite,
  subscribeToSession,
  unsubscribeSession,
  resetProgress,
} from "../controllers/sessionsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

// Public prebuilt sessions (
router.get("/prebuilt", protect, getPrebuiltSessions);

//Protected endpoints
router.use(protect);
router.post("/", uploadMiddleware.single("image"), createSession);
router.get("/mylist", getUserSessions);
router.post("/reset-progress", resetProgress);

router.post("/:id/favorite", protect, toggleFavorite);
router.post("/:id/subscribe", subscribeToSession);
router.put("/:id/progress", updateUserProgress);
router.delete("/:id/unsubscribe", unsubscribeSession);

router.get("/:id", protect, getSessionById);
router.put("/:id", protect, updateSessionData);
router.delete("/:id", protect, deleteSession);

export default router;
