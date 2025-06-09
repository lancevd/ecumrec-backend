import express from "express";
import {
  createAssessment,
  updateAssessmentSection,
  getSchoolAssessments,
  getCounselorAssessments,
  getStudentAssessments,
  getSingleAssessment,
  completeAssessment,
  getAssessmentStats,
  uploadAcademicRecords
} from "../controllers/assessment.controller.js";

// Import middleware (uncomment and adjust paths as needed)
// import { authenticate } from "../middleware/auth.js";
// import { authorize } from "../middleware/authorize.js";
// import { validateObjectId } from "../middleware/validation.js";
import {
  authenticate,
  authorize,
  authorizeOwnership,
  validateObjectId,
  validateMultipleObjectIds,
  rateLimit,
  authorizeAssessmentAccess,
  checkAssessmentModifiable,
} from "../middleware/auth.js";

const router = express.Router();

// Create a new assessment
// POST /api/assessments
// router.post("/", createAssessment);
// Create a new assessment (authenticated users only)
router.post("/", authorize(["staff", "admin"]), createAssessment);

// Get assessment statistics
// GET /api/assessments/stats?schoolId=xxx&counselorId=xxx
router.get("/stats", authorize(["staff", "admin"]), getAssessmentStats);

// Get all assessments for a specific school
// GET /api/assessments/school/:schoolId?status=ongoing&page=1&limit=10
router.get("/school/:schoolId", authorize(["admin"]), getSchoolAssessments);

// Get all assessments for a specific counselor
// GET /api/assessments/counselor/:counselorId?status=ongoing&page=1&limit=10
router.get(
  "/counselor/:counselorId",
  authorize(["staff", "admin"]),
  getCounselorAssessments
);

// Get all assessments for a specific student
// GET /api/assessments/student/:studentId?status=ongoing
router.get("/student/:studentId", authorize(["staff", "admin"]), getStudentAssessments);

// Get a single assessment by ID
// GET /api/assessments/:assessmentId
router.get("/:assessmentId", authorize(["staff", "admin"]), getSingleAssessment);

// Update a specific section of an assessment
// PUT /api/assessments/:assessmentId/section
router.put("/:assessmentId/section", authorize(["staff", "admin"]), updateAssessmentSection);
router.post('/:assessmentId/academic-records', uploadAcademicRecords);

// Complete an assessment
// PUT /api/assessments/:assessmentId/complete
router.put("/:assessmentId/complete", authorize(["staff", "admin"]), completeAssessment);


export default router;
