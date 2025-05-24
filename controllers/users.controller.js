import Counselor from "../models/counselor.model.js";
import Student from "../models/student.model.js";

// Get all counselors for a school
export const getSchoolCounselors = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const counselors = await Counselor.find({ schoolId })
            .select('firstName lastName email specialization')
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
            .select('firstName lastName admissionNumber')
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