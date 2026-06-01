import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Session from "../models/Session.js";
import { generateQuestion, evaluateAnswer } from "../services/groqService.js";

const getQuestionCategoryFromMode = (mode) => {
  const map = {
    HR: "hr",
    hr: "hr",
    Technical: "concepts",
    technical: "concepts",
    Mixed: "concepts",
    mixed: "concepts",
    DSA: "dsa",
    dsa: "dsa",
    SystemDesign: "system_design",
    systemdesign: "system_design",
    system_design: "system_design",
  };

  return map[mode] || "concepts";
};

export const generateQuestionHandler = async (req, res) => {
  console.log("USER:", req.user);
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    const session = await Session.findById(sessionId);
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

    const previousQuestions = await Question.find({ sessionId }).sort({
      questionNumber: 1,
      createdAt: 1,
    });
    const previousAnswers = await Answer.find({ sessionId });

    const answersByQuestionId = new Map(
      previousAnswers.map((answer) => [answer.questionId.toString(), answer]),
    );

    const previousQAs = previousQuestions
      .map((question, index) => {
        const answer = answersByQuestionId.get(question._id.toString());
        return `Q${index + 1}: ${question.questionText}\nA: ${answer ? answer.answerText : "Not answered"}`;
      })
      .join("\n\n");

    const questionText = await generateQuestion(
      session.role,
      session.difficulty,
      session.mode,
      previousQAs || "No previous questions yet.",
    );

    if (!questionText) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate question",
      });
    }

    const newQuestion = new Question({
      sessionId,
      questionText,
      questionNumber: previousQuestions.length + 1,
      category: getQuestionCategoryFromMode(session.mode),
    });

    const savedQuestion = await newQuestion.save();

    return res.status(201).json({
      success: true,
      message: "Question generated successfully",
      question: savedQuestion,
    });
  } catch (error) {
    console.error("generateQuestionHandler error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate question",
    });
  }
};

export const evaluateAnswerHandler = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    if (!questionId || !answerText) {
      return res.status(400).json({
        success: false,
        message: "questionId and answerText are required",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const session = await Session.findById(question.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const evaluation = await evaluateAnswer(
      question.questionText,
      answerText,
      session.role,
      session.difficulty,
      session.mode,
    );

    const newAnswer = new Answer({
      sessionId: session.id,
      questionId: question.id,
      answerText,
      score: evaluation.score,
      feedback: evaluation.feedback,
      idealAnswer: evaluation.idealAnswer,
    });

    const savedAnswer = await newAnswer.save();
    question.isAnswered = true;
    await question.save();

    return res.status(201).json({
      success: true,
      message: "Answer evaluated successfully",
      answer: savedAnswer,
    });
  } catch (error) {
    console.error("evaluateAnswerHandler error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
    });
  }
};
