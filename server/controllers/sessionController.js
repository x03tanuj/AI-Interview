import Session from "../models/Session.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";

export const startSession = async (req, res) => {
  try {
    const { mode, role, difficulty } = req.body;
    const userId = req.user.id;

    if (!mode || !role || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Mode, role and difficulty are required",
      });
    }

    const newSession = new Session({
      userId,
      mode,
      role,
      difficulty,
    });
    const savedSession = await newSession.save();
    res.status(201).json({
      success: true,
      message: "Session started successfully",
      session: savedSession,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to start session",
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status === "completed") {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    if (session.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get session",
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status === "completed") {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    if (session.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const answers = await Answer.find({ sessionId: session._id });
    const questions = await Question.find({ sessionId: session._id }).select(
      "_id category",
    );

    const categoryByQuestionId = new Map(
      questions.map((question) => [question._id.toString(), question.category]),
    );

    const scoredAnswers = answers
      .map((answer) => ({
        score: typeof answer.score === "number" ? answer.score : null,
        category: categoryByQuestionId.get(answer.questionId.toString()),
      }))
      .filter((item) => item.score !== null && item.category);

    const totalScore = scoredAnswers.reduce((sum, item) => sum + item.score, 0);
    const overallScore = scoredAnswers.length
      ? Number((totalScore / scoredAnswers.length).toFixed(2))
      : 0;

    const weakAreas = [
      ...new Set(
        scoredAnswers
          .filter((item) => item.score < 5)
          .map((item) => item.category),
      ),
    ];

    const strongAreas = [
      ...new Set(
        scoredAnswers
          .filter((item) => item.score >= 8)
          .map((item) => item.category),
      ),
    ];

    session.overallScore = overallScore;
    session.weakAreas = weakAreas;
    session.strongAreas = strongAreas;
    session.status = "completed";
    await session.save();
    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to complete session",
    });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Session history retrieved successfully",
      sessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get session history",
    });
  }
};
