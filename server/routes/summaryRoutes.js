import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getReport } from "../controllers/summaryController.js";

const router = express.Router();

router.get("/:sessionId", protect, getReport);

export default router;