import Counselor from "../models/counselor.model.js";

/**
 * Middleware to populate counselor profile
 * This ensures the counselor's profile is available in req.user
 */
export const populateCounselorProfile = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "counselor") {
      return next();
    }

    const counselor = await Counselor.findOne({ userId: req.user._id })
      .select("-__v")
      .lean();

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Counselor profile not found",
      });
    }

    // Attach the counselor profile to the request
    req.counselor = counselor;
    next();
  } catch (error) {
    console.error("Error in populateCounselorProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error populating counselor profile",
      error: error.message,
    });
  }
}; 