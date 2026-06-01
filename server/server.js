import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/summary", summaryRoutes);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {});
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });
