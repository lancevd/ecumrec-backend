import express from 'express';
import { getSchoolCounselors, getSchoolStudents } from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all counselors for a school
router.get('/counselors/:schoolId', verifyToken, getSchoolCounselors);

// Get all students for a school
router.get('/students/:schoolId', verifyToken, getSchoolStudents);

export default router; 