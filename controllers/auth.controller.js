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

// Counselor Authentication
export const counselorRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, schoolId, phone, specialization } = req.body;

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
            phone,
            specialization,
            role: 'staff'
        });

        await counselor.save();

        // Create token
        const token = jwt.sign(
            { id: counselor._id, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
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

// Student Authentication
export const studentRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, schoolId, dateOfBirth, grade, parentName, parentPhone } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new student
        const student = new Student({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            schoolId,
            dateOfBirth,
            grade,
            parentName,
            parentPhone,
            role: 'student'
        });

        await student.save();

        // Create token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: student._id,
                email: student.email,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if student exists
        const student = await Student.findOne({ email });
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
                email: student.email,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
