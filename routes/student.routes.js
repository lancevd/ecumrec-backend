import express from 'express';
import { 
    getCounselorStudents,
    getCounselorStudentProfile 
} from '../controllers/student.controller.js';

const router = express.Router();

// Get all active students with complete profiles for a school (counselor access only)
router.get('/counselor/:counselorId/schools/:schoolId/students', getCounselorStudents);

// Get a single student's profile for counselor (counselor access only)
router.get('/counselor/:counselorId/schools/:schoolId/students/:studentId', getCounselorStudentProfile);

export default router;
