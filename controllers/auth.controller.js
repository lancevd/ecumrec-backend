import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import School from '../models/school.model.js';
import Counselor from '../models/counselor.model.js';
import Student from '../models/student.model.js';

// School Authentication
export const schoolRegister = async (req, res) => {
    try {
        const { schoolName, email, password, address, phone, type, website } = req.body;

        // Check if school already exists
        const existingSchool = await School.findOne({ email });
        if (existingSchool) {
            return res.status(400).json({ message: 'School already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new school
        const school = new School({
            schoolName,
            email,
            password: hashedPassword,
            address,
            phone,
            type,
            website,
            isAdmin: true,
            role: 'admin'
        });

        await school.save();

        // Create token
        const token = jwt.sign(
            { id: school._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: school._id,
                email: school.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const schoolLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if school exists
        const school = await School.findOne({ email });
        if (!school) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, school.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: school._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: school._id,
                email: school.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin registration of counselors
export const registerCounselor = async (req, res) => {
    try {
        const { firstName, lastName, email, password, schoolId, specialization } = req.body;

        // Verify admin/school
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Check if counselor already exists
        const existingCounselor = await Counselor.findOne({ email });
        if (existingCounselor) {
            return res.status(400).json({ message: 'Counselor already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new counselor
        const counselor = new Counselor({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            schoolId,
            specialization,
            role: 'staff',
            active: true
        });

        await counselor.save();

        res.status(201).json({
            message: 'Counselor registered successfully',
            counselor: {
                id: counselor._id,
                firstName: counselor.firstName,
                lastName: counselor.lastName,
                email: counselor.email,
                role: 'staff'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin registration of students
export const registerStudent = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            admissionNumber, 
            password, 
            schoolId, 
        } = req.body;

        // Verify admin/school
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ admissionNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this admission number already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new student
        const student = new Student({
            firstName,
            lastName,
            admissionNumber,
            password: hashedPassword,
            schoolId,
            role: 'student',
            active: true
        });

        await student.save();

        res.status(201).json({
            message: 'Student registered successfully',
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                admissionNumber: student.admissionNumber,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Counselor Login
export const counselorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if counselor exists
        const counselor = await Counselor.findOne({ email });
        if (!counselor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, counselor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: counselor._id, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: counselor._id,
                email: counselor.email,
                role: 'staff'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Student Login (using admission number)
export const studentLogin = async (req, res) => {
    try {
        const { admissionNumber, password } = req.body;

        // Check if student exists
        const student = await Student.findOne({ admissionNumber });
        if (!student) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: student._id,
                admissionNumber: student.admissionNumber,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
