import Session from "../models/Session.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

export const getReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const questions = await Question.find({ sessionId }).sort({
      questionNumber: 1,
      createdAt: 1,
    });
    const answers = await Answer.find({ sessionId }).sort({
      createdAt: 1,
    });

    const scoredAnswers = answers.filter(
      (answer) => typeof answer.score === "number",
    );

    const overallScore = scoredAnswers.length
      ? scoredAnswers.reduce((sum, answer) => sum + answer.score, 0) /
        scoredAnswers.length
      : 0;

    const answersByQuestionId = new Map(
      answers.map((answer) => [answer.questionId.toString(), answer]),
    );

    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter((question) => question.isAnswered)
      .length;

    const categoryByQuestionId = new Map(
      questions.map((question) => [question._id.toString(), question.category]),
    );

    const scoredQuestionRows = answers
      .map((answer) => ({
        score: typeof answer.score === "number" ? answer.score : null,
        category: categoryByQuestionId.get(answer.questionId.toString()),
      }))
      .filter((item) => item.score !== null && item.category);

    const weakAreas = [
      ...new Set(
        scoredQuestionRows
          .filter((item) => item.score < 5)
          .map((item) => item.category),
      ),
    ];

    const strongAreas = [
      ...new Set(
        scoredQuestionRows
          .filter((item) => item.score >= 8)
          .map((item) => item.category),
      ),
    ];

    const mergedQA = questions.map((question) => {
      const answer = answersByQuestionId.get(question._id.toString());

      return {
        questionId: question._id,
        questionNumber: question.questionNumber,
        category: question.category,
        questionText: question.questionText,
        isAnswered: question.isAnswered,
        answer: answer
          ? {
              answerId: answer._id,
              answerText: answer.answerText,
              score: answer.score,
              feedback: answer.feedback,
              idealAnswer: answer.idealAnswer,
              timeTaken: answer.timeTaken,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Session report retrieved successfully",
      session: {
        sessionId: session._id,
        mode: session.mode,
        role: session.role,
        difficulty: session.difficulty,
        overallScore: Number(overallScore.toFixed(1)),
        weakAreas,
        strongAreas,
      },
      stats: {
        totalQuestions,
        answeredQuestions,
        completionRate:
          totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 0,
      },
      questions,
      answers: answers.map((answer) => ({
        answerId: answer._id,
        questionId: answer.questionId,
        answerText: answer.answerText,
        score: answer.score,
        feedback: answer.feedback,
        idealAnswer: answer.idealAnswer,
        timeTaken: answer.timeTaken,
      })),
      mergedQA,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate session report",
    });
  }
};
