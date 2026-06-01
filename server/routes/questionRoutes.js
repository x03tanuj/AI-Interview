import express from "express";
import {
  generateQuestionHandler,
  evaluateAnswerHandler,
} from "../controllers/questionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuestionHandler);
router.post("/evaluate", protect, evaluateAnswerHandler);

export default router;
