import express from 'express';
import {
    schoolRegister,
    schoolLogin,
    counselorRegister,
    counselorLogin,
    studentRegister,
    studentLogin
} from '../controllers/auth.controller.js';

const router = express.Router();

// School routes
router.post('/school/register', schoolRegister);
router.post('/school/login', schoolLogin);

// Counselor routes
router.post('/counselor/register', counselorRegister);
router.post('/counselor/login', counselorLogin);

// Student routes
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);

export default router; 