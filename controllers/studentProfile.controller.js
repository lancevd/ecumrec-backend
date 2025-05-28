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
      lastName,
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
      'lastName',
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
      lastName,
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

    // // Validate father data if provided
    // if (hasFather) {
    //   const fatherRequiredFields = [
    //     'fatherName',
    //     'fatherContactAddress',
    //     'fatherResidentialAddress',
    //     'fatherPhone',
    //     'fatherState',
    //     'fatherNationality',
    //     'fatherReligion',
    //     'fatherEducationLevel',
    //     'fatherOccupation',
    //     'fatherDeceased'
    //   ];

    //   const missingFatherFields = fatherRequiredFields.filter(field => !req.body[field]);
    //   if (missingFatherFields.length > 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `Missing required fields for father: ${missingFatherFields.join(', ')}`
    //     });
    //   }
    // }

    // Validate mother data if provided
    // if (hasMother) {
    //   const motherRequiredFields = [
    //     'motherName',
    //     'motherContactAddress',
    //     'motherResidentialAddress',
    //     'motherPhone',
    //     'motherState',
    //     'motherNationality',
    //     'motherReligion',
    //     'motherEducationLevel',
    //     'motherOccupation',
    //     'motherDeceased'
    //   ];

    //   const missingMotherFields = motherRequiredFields.filter(field => !req.body[field]);
    //   if (missingMotherFields.length > 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `Missing required fields for mother: ${missingMotherFields.join(', ')}`
    //     });
    //   }
    // }

    // // Validate guardian data if provided
    // if (hasGuardian) {
    //   const guardianRequiredFields = [
    //     'guardianName',
    //     'guardianContactAddress',
    //     'guardianResidentialAddress',
    //     'guardianPhone',
    //     'guardianState',
    //     'guardianNationality',
    //     'guardianReligion',
    //     'guardianEducationLevel',
    //     'guardianOccupation',
    //     'guardianDeceased'
    //   ];

    //   const missingGuardianFields = guardianRequiredFields.filter(field => !req.body[field]);
    //   if (missingGuardianFields.length > 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `Missing required fields for guardian: ${missingGuardianFields.join(', ')}`
    //     });
    //   }
    // }

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
    const requiredFields = [
      'fatherWives',
      'motherPosition',
      'totalSiblings',
      'maleSiblings',
      'femaleSiblings',
      'positionAmongSiblings',
      'parentsStatus'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate numeric fields
    const numericFields = ['fatherWives', 'totalSiblings', 'maleSiblings', 'femaleSiblings', 'positionAmongSiblings'];
    const invalidNumericFields = numericFields.filter(field => isNaN(req.body[field]));
    if (invalidNumericFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid numeric values for fields: ${invalidNumericFields.join(', ')}`
      });
    }

    // Validate minimum values
    if (req.body.fatherWives < 1) {
      return res.status(400).json({
        success: false,
        message: "Father must have at least 1 wife"
      });
    }

    if (req.body.totalSiblings < 0 || req.body.maleSiblings < 0 || req.body.femaleSiblings < 0) {
      return res.status(400).json({
        success: false,
        message: "Number of siblings cannot be negative"
      });
    }

    if (req.body.positionAmongSiblings < 1) {
      return res.status(400).json({
        success: false,
        message: "Position among siblings must be at least 1"
      });
    }

    // Validate total siblings equals sum of male and female siblings
    if (req.body.totalSiblings !== (Number(req.body.maleSiblings) + Number(req.body.femaleSiblings))) {
      return res.status(400).json({
        success: false,
        message: "Total siblings must equal the sum of male and female siblings"
      });
    }

    // Validate position among siblings
    if (req.body.positionAmongSiblings > req.body.totalSiblings) {
      return res.status(400).json({
        success: false,
        message: "Position among siblings cannot be greater than total siblings"
      });
    }

    // Validate mother's position
    const validMotherPositions = ['First Wife', 'Second Wife', 'Third Wife', 'Fourth Wife', 'other'];
    if (!validMotherPositions.includes(req.body.motherPosition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mother's position"
      });
    }

    // Validate parents' status
    const validParentStatuses = ['Living Together', 'Living Apart', 'Separated', 'Divorced'];
    if (!validParentStatuses.includes(req.body.parentsStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parents' status"
      });
    }

    // Update student's family structure
    student.familyStructure = {
      ...req.body,
      completed: true
    };

    // Mark family structure as completed
    student.profileStatus.familyStructure = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(status => status === true);

    await student.save();

    res.status(200).json({
      success: true,
      message: "Family structure updated successfully",
      data: {
        familyStructure: student.familyStructure,
        profileStatus: student.profileStatus,
        profileComplete: student.profileComplete
      }
    });
  } catch (error) {
    console.error('Error updating family structure:', error);
    res.status(500).json({
      success: false,
      message: "Error updating family structure",
      error: error.message
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

    // Validate years if provided
    const validateSchoolYears = (admissionYear, graduationYear, schoolType) => {
      if (admissionYear && graduationYear) {
        // Validate years are numbers
        if (isNaN(admissionYear) || isNaN(graduationYear)) {
          throw new Error(`${schoolType}: Admission and graduation years must be numbers`);
        }

        // Validate year ranges
        const currentYear = new Date().getFullYear();
        if (admissionYear < 1900 || admissionYear > currentYear) {
          throw new Error(`${schoolType}: Invalid admission year`);
        }
        if (graduationYear < 1900 || graduationYear > currentYear) {
          throw new Error(`${schoolType}: Invalid graduation year`);
        }

        // Validate admission year is before graduation year
        if (admissionYear > graduationYear) {
          throw new Error(`${schoolType}: Admission year must be before graduation year`);
        }
      }
    };

    try {
      // Validate years for each school level if provided
      validateSchoolYears(
        req.body.schools?.primaryAdmissionYear,
        req.body.schools?.primaryGraduationYear,
        'Primary School'
      );
      validateSchoolYears(
        req.body.schools?.juniorSecondaryAdmissionYear,
        req.body.schools?.juniorSecondaryGraduationYear,
        'Junior Secondary School'
      );
      validateSchoolYears(
        req.body.schools?.seniorSecondaryAdmissionYear,
        req.body.schools?.seniorSecondaryGraduationYear,
        'Senior Secondary School'
      );
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Validate current grade and academic performance
    // if (!req.body.currentGrade || !req.body.academicPerformance) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Current grade and academic performance are required"
    //   });
    // }

    // Update student's educational background
    student.educationalBackground = {
      ...req.body,
      completed: true
    };

    // Mark educational background as completed
    student.profileStatus.educationalBackground = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(status => status === true);

    await student.save();

    res.status(200).json({
      success: true,
      message: "Educational background updated successfully",
      data: {
        educationalBackground: student.educationalBackground,
        profileStatus: student.profileStatus,
        profileComplete: student.profileComplete
      }
    });
  } catch (error) {
    console.error('Error updating educational background:', error);
    res.status(500).json({
      success: false,
      message: "Error updating educational background",
      error: error.message
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