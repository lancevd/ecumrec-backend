import express from 'express';
import { 
    getSchoolCounselors,
    getSchoolStudents,
    getSingleStudent,
    getSingleCounselor 
} from '../controllers/users.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all counselors for a school
router.get('/schools/:schoolId/counselors', verifyToken, getSchoolCounselors);

// Get all students for a school
router.get('/schools/:schoolId/students', [verifyToken, checkRole(['admin'])], getSchoolStudents);

// Get a single student by ID
router.get('/schools/:schoolId/students/:studentId', [verifyToken, checkRole(['admin'])], getSingleStudent);

// Get a single counselor by ID
// Only admin can access this route
router.get('/schools/:schoolId/counselors/:counselorId', [verifyToken, checkRole(['admin'])], getSingleCounselor);

export default router;
