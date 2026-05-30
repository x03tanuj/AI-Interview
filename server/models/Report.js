import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
	{
		sessionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Session",
			required: true,
			unique: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		overallScore: {
			type: Number,
		},
		categoryBreakdown: [
			{
				category: String,
				score: Number,
				totalAsked: Number,
			},
		],
		weakAreas: [String],
		recommendation: {
			type: String,
		},
		isPublic: {
			type: Boolean,
			default: false,
		},
		publicToken: {
			type: String,
		},
	},
	{ timestamps: true },
);

export default mongoose.model("Report", reportSchema);
