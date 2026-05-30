import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mode: {
      type: String,
      enum: ["technical", "hr", "mixed"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    weakAreas: [String],
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
