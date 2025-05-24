import Student from "../models/student.model.js";

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    let studentId;
    
    // If studentId is provided in params, use it (for admin/counselor access)
    if (req.params.studentId) {
      // Check if the requesting user has permission
      if (req.user.role === "student") {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access other student profiles",
        });
      }
      
      // For counselors, check if they belong to the same school
      if (req.user.role === "counselor" && req.user.schoolId.toString() !== req.body.schoolId) {
        return res.status(403).json({
          success: false,
          message: "You can only access profiles of students in your school",
        });
      }
      
      studentId = req.params.studentId;
    } else {
      // Use the authenticated user's ID (for self-access)
      studentId = req.user.id;
    }

    const student = await Student.findById(studentId)
      .select("-password")
      .populate("schoolId", "name");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        basicInfo: {
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
          role: student.role,
          active: student.active,
          createdAt: student.createdAt,
          school: student.schoolId
        },
        profileStatus: {
          profileComplete: student.profileComplete,
          completedSections: {
            personalData: student.personalData?.completed || false,
            familyBackground: student.familyBackground?.completed || false,
            familyStructure: student.familyStructure?.completed || false,
            educationalBackground: student.educationalBackground?.completed || false,
            notes: student.notes?.completed || false
          }
        },
        personalData: student.personalData,
        familyBackground: student.familyBackground,
        familyStructure: student.familyStructure,
        educationalBackground: student.educationalBackground,
        notes: student.notes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update personal data
export const updatePersonalData = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    const requiredFields = [
      "gender",
      "dateOfBirth",
      "placeOfBirth",
      "nationality",
      "religion",
      "address",
      "phoneNumber",
      "emergencyContact",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    student.personalData = {
      ...req.body,
      completed: true,
    };

    await student.save();

    res.status(200).json({
      success: true,
      message: "Personal data updated successfully",
      data: student.personalData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update family background
export const updateFamilyBackground = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    const requiredFields = ["parents", "familyIncome", "familySize"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate parents data
    if (req.body.parents && Array.isArray(req.body.parents)) {
      if (req.body.parents.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one parent/guardian is required",
        });
      }

      const parentRequiredFields = ["name", "relationship", "occupation", "education", "phone"];
      const invalidParents = req.body.parents.filter((parent) =>
        parentRequiredFields.some((field) => !parent[field])
      );

      if (invalidParents.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent data. Each parent must have name, relationship, occupation, education, and phone",
        });
      }

      // Validate relationship types
      const validRelationships = ["Father", "Mother", "Guardian"];
      const invalidRelationships = req.body.parents.filter(
        (parent) => !validRelationships.includes(parent.relationship)
      );

      if (invalidRelationships.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid relationship type. Must be one of: Father, Mother, Guardian",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Parents data must be an array",
      });
    }

    student.familyBackground = {
      ...req.body,
      completed: true,
    };

    await student.save();

    res.status(200).json({
      success: true,
      message: "Family background updated successfully",
      data: student.familyBackground,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update family structure
export const updateFamilyStructure = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    const requiredFields = ["siblings", "livingWith", "familyType"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate siblings data
    if (req.body.siblings) {
      const siblingRequiredFields = ["name", "age", "relationship"];
      const invalidSiblings = req.body.siblings.filter((sibling) =>
        siblingRequiredFields.some((field) => !sibling[field])
      );

      if (invalidSiblings.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid sibling data. Each sibling must have name, age, and relationship",
        });
      }
    }

    student.familyStructure = {
      ...req.body,
      completed: true,
    };

    await student.save();

    res.status(200).json({
      success: true,
      message: "Family structure updated successfully",
      data: student.familyStructure,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update educational background
export const updateEducationalBackground = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    const requiredFields = ["schools", "currentGrade", "academicPerformance"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate schools data
    if (req.body.schools && Array.isArray(req.body.schools)) {
      if (req.body.schools.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one school is required",
        });
      }

      const schoolRequiredFields = ["name", "level", "startDate", "endDate"];
      const invalidSchools = req.body.schools.filter((school) =>
        schoolRequiredFields.some((field) => !school[field])
      );

      if (invalidSchools.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid school data. Each school must have name, level, start date, and end date",
        });
      }

      // Validate school levels
      const validLevels = ["Primary", "Junior Secondary", "Senior Secondary"];
      const invalidLevels = req.body.schools.filter(
        (school) => !validLevels.includes(school.level)
      );

      if (invalidLevels.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid school level. Must be one of: Primary, Junior Secondary, Senior Secondary",
        });
      }

      // Validate that there's only one current school
      const currentSchools = req.body.schools.filter(school => school.currentSchool);
      if (currentSchools.length > 1) {
        return res.status(400).json({
          success: false,
          message: "Only one school can be marked as current",
        });
      }

      // Validate that dates are in correct order
      const invalidDates = req.body.schools.filter(
        school => new Date(school.startDate) > new Date(school.endDate)
      );

      if (invalidDates.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date for all schools",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Schools data must be an array",
      });
    }

    student.educationalBackground = {
      ...req.body,
      completed: true,
    };

    await student.save();

    res.status(200).json({
      success: true,
      message: "Educational background updated successfully",
      data: student.educationalBackground,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update notes
export const updateNotes = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.notes = {
      ...req.body,
      completed: true,
    };

    // Check if all sections are completed
    const allSectionsCompleted =
      student.personalData?.completed &&
      student.familyBackground?.completed &&
      student.familyStructure?.completed &&
      student.educationalBackground?.completed &&
      student.notes?.completed;

    if (allSectionsCompleted) {
      student.profileComplete = true;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      data: student.notes,
      profileComplete: student.profileComplete,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 