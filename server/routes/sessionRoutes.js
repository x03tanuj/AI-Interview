import express from "express";
import {
  startSession,
  getSession,
  endSession,
  getSessionHistory,
} from "../controllers/sessionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, startSession);
router.get("/history", protect, getSessionHistory);
router.get("/:id", protect, getSession);
router.patch("/:id/end", protect, endSession);

export default router;
