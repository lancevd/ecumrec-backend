import Counselor from "../models/counselor.model.js";
import Student from "../models/student.model.js";

// Get all active students with complete profiles for a school
export const getCounselorStudents = async (req, res) => {
  try {
    const { schoolId, counselorId } = req.params;
    // const { role } = req.user;

    const counselor = await Counselor.findOne({
      _id: counselorId,
      schoolId,
    }).select("-__v");
    // Only counselors can access this route
    if (!counselor) {
      return res.status(403).json({
        success: false,
        message: "Access denied: counselors only",
      });
    }

    const students = await Student.find({
      schoolId,
      active: true,
      profileComplete: true,
    })
      .select("firstName lastName admissionNumber active profileComplete")
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single student's profile for counselor
export const getCounselorStudentProfile = async (req, res) => {
  try {
    const { studentId, schoolId, counselorId } = req.params;

    const counselor = await Counselor.findOne({
      _id: counselorId,
      schoolId,
    }).select("-__v");
    // Only counselors can access this route
    if (!counselor) {
      return res.status(403).json({
        success: false,
        message: "Access denied: counselors only",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      active: true,
      profileComplete: true,
    }).select("-__v");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or not from this school",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
