import express from "express";
import { getRandomQuote } from "../controllers/quotesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/random", protect, getRandomQuote);

export default router;
