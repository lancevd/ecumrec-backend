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
    const {
      surname,
      firstName,
      gender,
      admissionNumber,
      yearOfAdmission,
      collegeHouse,
      dateOfBirth,
      placeOfBirth,
      address,
      contactAddress,
      stateOfOrigin,
      languagesSpoken,
      countriesVisited,
      religion,
      nationality,
      changeOfName,
      changeOfNameDate,
      evidence
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'surname',
      'firstName',
      'gender',
      'admissionNumber',
      'yearOfAdmission',
      'dateOfBirth',
      'placeOfBirth',
      'address',
      'contactAddress',
      'stateOfOrigin',
      'religion',
      'nationality'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate gender
    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be either Male or Female'
      });
    }

    // Validate year of admission
    if (isNaN(yearOfAdmission) || yearOfAdmission < 1900 || yearOfAdmission > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year of admission'
      });
    }

    // Validate date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date of birth'
      });
    }

    // Validate change of name date if change of name is provided
    if (changeOfName && changeOfNameDate) {
      const changeDate = new Date(changeOfNameDate);
      if (isNaN(changeDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid change of name date'
        });
      }
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update personal data
    student.personalData = {
      surname,
      firstName,
      gender,
      admissionNumber,
      yearOfAdmission,
      collegeHouse,
      dateOfBirth,
      placeOfBirth,
      address,
      contactAddress,
      stateOfOrigin,
      languagesSpoken,
      countriesVisited,
      religion,
      nationality,
      changeOfName,
      changeOfNameDate,
      evidence
    };

    // Initialize profileStatus if it doesn't exist
    if (!student.profileStatus) {
      student.profileStatus = {
        personalData: false,
        familyBackground: false,
        familyStructure: false,
        educationalBackground: false,
        notes: false
      };
    }

    // Mark personal data as completed
    student.profileStatus.personalData = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(status => status === true);

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Personal data updated successfully',
      data: {
        personalData: student.personalData,
        profileStatus: student.profileStatus,
        profileComplete: student.profileComplete
      }
    });
  } catch (error) {
    console.error('Error updating personal data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating personal data',
      error: error.message
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

    // Check if at least one family member is provided
    const hasFather = Object.keys(req.body).some(key => key.startsWith('father'));
    const hasMother = Object.keys(req.body).some(key => key.startsWith('mother'));
    const hasGuardian = Object.keys(req.body).some(key => key.startsWith('guardian'));

    if (!hasFather && !hasMother && !hasGuardian) {
      return res.status(400).json({
        success: false,
        message: "At least one family member (father, mother, or guardian) must be provided"
      });
    }

    // Validate father data if provided
    if (hasFather) {
      const fatherRequiredFields = [
        'fatherName',
        'fatherContactAddress',
        'fatherResidentialAddress',
        'fatherPhone',
        'fatherState',
        'fatherNationality',
        'fatherReligion',
        'fatherEducationLevel',
        'fatherOccupation',
        'fatherDeceased'
      ];

      const missingFatherFields = fatherRequiredFields.filter(field => !req.body[field]);
      if (missingFatherFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields for father: ${missingFatherFields.join(', ')}`
        });
      }
    }

    // Validate mother data if provided
    if (hasMother) {
      const motherRequiredFields = [
        'motherName',
        'motherContactAddress',
        'motherResidentialAddress',
        'motherPhone',
        'motherState',
        'motherNationality',
        'motherReligion',
        'motherEducationLevel',
        'motherOccupation',
        'motherDeceased'
      ];

      const missingMotherFields = motherRequiredFields.filter(field => !req.body[field]);
      if (missingMotherFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields for mother: ${missingMotherFields.join(', ')}`
        });
      }
    }

    // Validate guardian data if provided
    if (hasGuardian) {
      const guardianRequiredFields = [
        'guardianName',
        'guardianContactAddress',
        'guardianResidentialAddress',
        'guardianPhone',
        'guardianState',
        'guardianNationality',
        'guardianReligion',
        'guardianEducationLevel',
        'guardianOccupation',
        'guardianDeceased'
      ];

      const missingGuardianFields = guardianRequiredFields.filter(field => !req.body[field]);
      if (missingGuardianFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields for guardian: ${missingGuardianFields.join(', ')}`
        });
      }
    }

    // Prepare family background data
    const familyBackground = {};

    if (hasFather) {
      familyBackground.father = {
        name: req.body.fatherName,
        contactAddress: req.body.fatherContactAddress,
        residentialAddress: req.body.fatherResidentialAddress,
        phone: req.body.fatherPhone,
        state: req.body.fatherState,
        nationality: req.body.fatherNationality,
        religion: req.body.fatherReligion,
        educationLevel: req.body.fatherEducationLevel,
        occupation: req.body.fatherOccupation,
        deceased: req.body.fatherDeceased,
        dateOfBirth: req.body.fatherDob
      };
    }

    if (hasMother) {
      familyBackground.mother = {
        name: req.body.motherName,
        contactAddress: req.body.motherContactAddress,
        residentialAddress: req.body.motherResidentialAddress,
        phone: req.body.motherPhone,
        state: req.body.motherState,
        nationality: req.body.motherNationality,
        religion: req.body.motherReligion,
        educationLevel: req.body.motherEducationLevel,
        occupation: req.body.motherOccupation,
        deceased: req.body.motherDeceased,
        dateOfBirth: req.body.motherDob
      };
    }

    if (hasGuardian) {
      familyBackground.guardian = {
        name: req.body.guardianName,
        contactAddress: req.body.guardianContactAddress,
        residentialAddress: req.body.guardianResidentialAddress,
        phone: req.body.guardianPhone,
        state: req.body.guardianState,
        nationality: req.body.guardianNationality,
        religion: req.body.guardianReligion,
        educationLevel: req.body.guardianEducationLevel,
        occupation: req.body.guardianOccupation,
        deceased: req.body.guardianDeceased,
        dateOfBirth: req.body.guardianDob
      };
    }

    // Update student's family background
    student.familyBackground = familyBackground;

    // Mark family background as completed
    student.profileStatus.familyBackground = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(status => status === true);

    await student.save();

    res.status(200).json({
      success: true,
      message: "Family background updated successfully",
      data: {
        familyBackground: student.familyBackground,
        profileStatus: student.profileStatus,
        profileComplete: student.profileComplete
      }
    });
  } catch (error) {
    console.error('Error updating family background:', error);
    res.status(500).json({
      success: false,
      message: "Error updating family background",
      error: error.message
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