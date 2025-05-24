import express from "express";
import {
  getStudentProfile,
  updatePersonalData,
  updateFamilyBackground,
  updateFamilyStructure,
  updateEducationalBackground,
  updateNotes,
} from "../controllers/studentProfile.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get student profile (both self and by ID)
router.get("/", getStudentProfile); // Self access
router.get("/:studentId", getStudentProfile); // Access by ID

// Update routes (only self-access)
router.put("/personal-data", updatePersonalData);
router.put("/family-background", updateFamilyBackground);
router.put("/family-structure", updateFamilyStructure);
router.put("/educational-background", updateEducationalBackground);
router.put("/notes", updateNotes);

export default router; 