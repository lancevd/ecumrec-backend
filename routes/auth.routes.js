import express from 'express';
import {
    schoolRegister,
    schoolLogin,
    registerCounselor,
    counselorLogin,
    registerStudent,
    studentLogin
} from '../controllers/auth.controller.js';

const router = express.Router();

// School routes
router.post('/school/register', schoolRegister);
router.post('/school/login', schoolLogin);

// Counselor routes
router.post('/counselor/register', registerCounselor);
router.post('/counselor/login', counselorLogin);

// Student routes
router.post('/student/register', registerStudent);
router.post('/student/login', studentLogin);

export default router; 