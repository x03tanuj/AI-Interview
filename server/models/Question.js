import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      enum: ["dsa", "concepts", "hr", "system_design"],
      required: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

questionSchema.index({ sessionId: 1, questionNumber: 1 }, { unique: true });

export default mongoose.model("Question", questionSchema);
