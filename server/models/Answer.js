import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    answerText: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      min: 1,
      max: 10,
    },

    feedback: {
      type: String,
    },

    idealAnswer: {
      type: String,
    },

    timeTaken: {
      type: Number,
    },
  },
  { timestamps: true },
);

answerSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });

export default mongoose.model("Answer", answerSchema);
