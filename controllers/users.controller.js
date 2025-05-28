import Counselor from "../models/counselor.model.js";
import Student from "../models/student.model.js";

// Get all counselors for a school
export const getSchoolCounselors = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const counselors = await Counselor.find({ schoolId })
            .select('firstName lastName email specialization active')
            .sort({ lastName: 1, firstName: 1 });

        res.json({
            success: true,
            data: counselors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all students for a school
export const getSchoolStudents = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const students = await Student.find({ schoolId })
            .select('firstName lastName admissionNumber active')
            .sort({ lastName: 1, firstName: 1 });

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single student by ID
export const getSingleStudent = async (req, res) => {
    try {
        const { studentId, schoolId } = req.params;

        const student = await Student.findOne({
            _id: studentId,
            schoolId
        })
        .select('-__v');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or not from this school'
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single counselor by ID
export const getSingleCounselor = async (req, res) => {
    try {
        const { counselorId, schoolId } = req.params;

        const counselor = await Counselor.findOne({
            _id: counselorId,
            schoolId
        })
        .select('-__v');

        if (!counselor) {
            return res.status(404).json({
                success: false,
                message: 'Counselor not found or not from this school'
            });
        }

        res.json({
            success: true,
            data: counselor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};