import Session from "../models/Session.js";

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
