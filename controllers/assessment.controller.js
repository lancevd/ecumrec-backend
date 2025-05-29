import Assessment from "../models/assessment.model.js";
import Student from "../models/student.model.js";
import { validateObjectId } from "../utils/validation.js";
import mongoose from "mongoose";


// Additional helper function to get assessment statistics
export const getAssessmentStats = async (req, res) => {
  try {
    const { schoolId, counselorId } = req.query;

    let matchQuery = {};
    if (schoolId) matchQuery.schoolId = new mongoose.Types.ObjectId(schoolId);
    if (counselorId)
      matchQuery.counselorId = new mongoose.Types.ObjectId(counselorId);

    const stats = await Assessment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAssessments = await Assessment.countDocuments(matchQuery);

    const formattedStats = {
      total: totalAssessments,
      ongoing: 0,
      completed: 0,
      false: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: "Assessment statistics retrieved successfully",
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error getting assessment stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Create a new assessment
export const createAssessment = async (req, res) => {
  try {
    const { schoolId, counselorId, studentId } = req.body;

    // Validate required fields
    if (!schoolId || !counselorId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "School ID, Counselor ID, and Student ID are required",
      });
    }

    // Check if assessment already exists for this student
    const existingAssessment = await Assessment.findOne({
      studentId,
      status: { $in: ["ongoing", "completed"] },
    });

    if (existingAssessment) {
      return res.status(400).json({
        success: false,
        message: "An active assessment already exists for this student",
      });
    }

    // Create new assessment with default values
    const newAssessment = new Assessment({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      counselorId: new mongoose.Types.ObjectId(counselorId),
      studentId: new mongoose.Types.ObjectId(studentId),
      status: "ongoing",
      physicalDevelopment: {},
      physicalDisabilities: { status: false },
      healthRecords: { status: false },
      disciplineRecords: { status: false, records: [] },
      standardizedTests: { status: false, tests: [] },
      academicRecords: { classes: [] },
      observations: { status: false },
      vocationalInterests: { status: false, interests: [] },
      overallRemark: { remark: "" },
    });

    const savedAssessment = await newAssessment.save();

    res.status(201).json({
      success: true,
      message:
        "Assessment created successfully!",
      data: savedAssessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Update a specific section of an assessment
export const updateAssessmentSection = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { section, data } = req.body;

    // Validate required fields
    if (!section || !data) {
      return res.status(400).json({
        success: false,
        message: "Section and data are required",
      });
    }

    // Valid sections
    const validSections = [
      "physicalDevelopment",
      "physicalDisabilities",
      "healthRecords",
      "disciplineRecords",
      "standardizedTests",
      "academicRecords",
      "observations",
      "vocationalInterests",
      "overallRemark",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section specified",
      });
    }

    // Find and update the assessment
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Check if assessment is completed
    if (assessment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed assessment",
      });
    }

    // Update the specific section
    assessment[section] = { ...assessment[section].toObject(), ...data };

    const updatedAssessment = await assessment.save();

    res.status(200).json({
      success: true,
      message: `${section} updated successfully`,
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("Error updating assessment section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all assessments for a school
export const getSchoolAssessments = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get assessments with pagination
    const assessments = await Assessment.find(query)
      .populate("counselorId", "name email")
      .populate("studentId", "firstName lastName studentId class")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Assessment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "School assessments retrieved successfully",
      data: assessments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: skip + assessments.length < totalCount,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error getting school assessments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all assessments for a counselor
export const getCounselorAssessments = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { counselorId: new mongoose.Types.ObjectId(counselorId) };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get assessments with pagination
    const assessments = await Assessment.find(query)
      .populate("studentId", "firstName lastName studentId class")
      .populate("schoolId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Assessment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Counselor assessments retrieved successfully",
      data: assessments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: skip + assessments.length < totalCount,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error getting counselor assessments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all assessments for a student
export const getStudentAssessments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    // Build query
    const query = { studentId: new mongoose.Types.ObjectId(studentId) };
    if (status) {
      query.status = status;
    }

    // Get assessments
    const assessments = await Assessment.find(query)
      .populate("counselorId", "name email")
      .populate("schoolId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Student assessments retrieved successfully",
      data: assessments,
    });
  } catch (error) {
    console.error("Error getting student assessments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single assessment by ID
export const getSingleAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId)
      .populate("counselorId", "name email")
      .populate("studentId", "firstName lastName studentId class dateOfBirth")
      .populate("schoolId", "name address");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment retrieved successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("Error getting single assessment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Complete an assessment
export const completeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { overallRemark } = req.body;

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Check if assessment is already completed
    if (assessment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Assessment is already completed",
      });
    }

    // Validate required sections - Standardized Tests is compulsory
    if (
      !assessment.standardizedTests.status ||
      assessment.standardizedTests.tests.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Standardized Tests section is required and must have at least one test record",
      });
    }

    // Update assessment status and overall remark
    assessment.status = "completed";
    if (overallRemark) {
      assessment.overallRemark.remark = overallRemark;
    }

    const completedAssessment = await assessment.save();

    res.status(200).json({
      success: true,
      message: "Assessment completed successfully",
      data: completedAssessment,
    });
  } catch (error) {
    console.error("Error completing assessment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

