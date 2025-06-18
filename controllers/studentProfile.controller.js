import Student from "../models/student.model.js";

// Helper function to format dates in student profile data
const formatStudentDates = (student) => {
  const formatted = student.toObject();
  
  // Format personal data dates
  if (formatted.personalData) {
    if (formatted.personalData.dateOfBirth) {
      formatted.personalData.dateOfBirth = new Date(formatted.personalData.dateOfBirth).toISOString().split('T')[0];
    }
    if (formatted.personalData.changeOfNameDate) {
      formatted.personalData.changeOfNameDate = new Date(formatted.personalData.changeOfNameDate).toISOString().split('T')[0];
    }
  }

  // Format family background dates
  if (formatted.familyBackground) {
    if (formatted.familyBackground.father?.dateOfBirth) {
      formatted.familyBackground.father.dateOfBirth = new Date(formatted.familyBackground.father.dateOfBirth).toISOString().split('T')[0];
    }
    if (formatted.familyBackground.mother?.dateOfBirth) {
      formatted.familyBackground.mother.dateOfBirth = new Date(formatted.familyBackground.mother.dateOfBirth).toISOString().split('T')[0];
    }
    if (formatted.familyBackground.guardian?.dateOfBirth) {
      formatted.familyBackground.guardian.dateOfBirth = new Date(formatted.familyBackground.guardian.dateOfBirth).toISOString().split('T')[0];
    }
  }

  // Format timestamps
  formatted.createdAt = new Date(formatted.createdAt).toISOString().split('T')[0];
  formatted.updatedAt = new Date(formatted.updatedAt).toISOString().split('T')[0];

  return formatted;
};

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
      if (
        req.user.role === "counselor" &&
        req.user.schoolId.toString() !== req.body.schoolId
      ) {
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

    const formattedStudent = formatStudentDates(student);

    // Check if all required sections are completed (excluding notes)
    const requiredSections = {
      personalData: formattedStudent.personalData?.completed || false,
      familyBackground: formattedStudent.familyBackground?.completed || false,
      familyStructure: formattedStudent.familyStructure?.completed || false,
      educationalBackground: formattedStudent.educationalBackground?.completed || false,
    };

    const isProfileComplete = Object.values(requiredSections).every(status => status === true);

    res.status(200).json({
      success: true,
      data: {
        basicInfo: {
          firstName: formattedStudent.firstName,
          lastName: formattedStudent.lastName,
          admissionNumber: formattedStudent.admissionNumber,
          role: formattedStudent.role,
          active: formattedStudent.active,
          createdAt: formattedStudent.createdAt,
          school: formattedStudent.schoolId,
        },
        profileStatus: {
          profileComplete: isProfileComplete,
          completedSections: {
            ...requiredSections,
            notes: formattedStudent.notes?.completed || false,
          },
        },
        personalData: formattedStudent.personalData,
        familyBackground: formattedStudent.familyBackground,
        familyStructure: formattedStudent.familyStructure,
        educationalBackground: formattedStudent.educationalBackground,
        notes: formattedStudent.notes,
      },
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
      evidence,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "lastName",
      "firstName",
      "gender",
      "admissionNumber",
      "yearOfAdmission",
      "dateOfBirth",
      "placeOfBirth",
      "address",
      "contactAddress",
      "stateOfOrigin",
      "religion",
      "nationality",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate gender
    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender must be either Male or Female",
      });
    }

    // Validate year of admission
    if (
      isNaN(yearOfAdmission) ||
      yearOfAdmission < 1900 ||
      yearOfAdmission > new Date().getFullYear()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year of admission",
      });
    }

    // Validate date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    // Validate change of name date if change of name is provided
    if (changeOfName && changeOfNameDate) {
      const changeDate = new Date(changeOfNameDate);
      if (isNaN(changeDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid change of name date",
        });
      }
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update student's first and last names in basic info
    student.firstName = firstName;
    student.lastName = lastName;

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
      evidence,
    };

    // Initialize profileStatus if it doesn't exist
    if (!student.profileStatus) {
      student.profileStatus = {
        personalData: false,
        familyBackground: false,
        familyStructure: false,
        educationalBackground: false,
        notes: false,
      };
    }

    // Mark personal data as completed
    student.profileStatus.personalData = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(
      (status) => status === true
    );

    await student.save();
    const formattedStudent = formatStudentDates(student);

    res.status(200).json({
      success: true,
      message: "Personal data updated successfully",
      data: {
        personalData: formattedStudent.personalData,
        profileStatus: formattedStudent.profileStatus,
        profileComplete: formattedStudent.profileComplete,
      },
    });
  } catch (error) {
    console.error("Error updating personal data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating personal data",
      error: error.message,
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
    const hasFather = Object.keys(req.body).some((key) =>
      key.startsWith("father")
    );
    const hasMother = Object.keys(req.body).some((key) =>
      key.startsWith("mother")
    );
    const hasGuardian = Object.keys(req.body).some((key) =>
      key.startsWith("guardian")
    );

    if (!hasFather && !hasMother && !hasGuardian) {
      return res.status(400).json({
        success: false,
        message:
          "At least one family member (father, mother, or guardian) must be provided",
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
        dateOfBirth: req.body.fatherdateOfBirth,
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
        dateOfBirth: req.body.motherdateOfBirth,
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
        dateOfBirth: req.body.guardiandateOfBirth,
      };
    }

    // Update student's family background
    student.familyBackground = familyBackground;

    // Mark family background as completed
    student.profileStatus.familyBackground = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(
      (status) => status === true
    );

    await student.save();
    const formattedStudent = formatStudentDates(student);

    res.status(200).json({
      success: true,
      message: "Family background updated successfully",
      data: {
        familyBackground: formattedStudent.familyBackground,
        profileStatus: formattedStudent.profileStatus,
        profileComplete: formattedStudent.profileComplete,
      },
    });
  } catch (error) {
    console.error("Error updating family background:", error);
    res.status(500).json({
      success: false,
      message: "Error updating family background",
      error: error.message,
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
      "fatherWives",
      "motherPosition",
      "totalSiblings",
      "maleSiblings",
      "femaleSiblings",
      "positionAmongSiblings",
      "parentsStatus",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate numeric fields
    const numericFields = [
      "fatherWives",
      "totalSiblings",
      "maleSiblings",
      "femaleSiblings",
      "positionAmongSiblings",
    ];
    const invalidNumericFields = numericFields.filter((field) =>
      isNaN(req.body[field])
    );
    if (invalidNumericFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid numeric values for fields: ${invalidNumericFields.join(
          ", "
        )}`,
      });
    }

    // Validate minimum values
    if (req.body.fatherWives < 1) {
      return res.status(400).json({
        success: false,
        message: "Father must have at least 1 wife",
      });
    }

    if (
      req.body.totalSiblings < 0 ||
      req.body.maleSiblings < 0 ||
      req.body.femaleSiblings < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Number of siblings cannot be negative",
      });
    }

    if (req.body.positionAmongSiblings < 1) {
      return res.status(400).json({
        success: false,
        message: "Position among siblings must be at least 1",
      });
    }

    // Validate total siblings equals sum of male and female siblings
    if (
      req.body.totalSiblings !==
      Number(req.body.maleSiblings) + Number(req.body.femaleSiblings)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total siblings must equal the sum of male and female siblings",
      });
    }

    // Validate position among siblings
    if (req.body.positionAmongSiblings > req.body.totalSiblings) {
      return res.status(400).json({
        success: false,
        message:
          "Position among siblings cannot be greater than total siblings",
      });
    }

    // Validate mother's position
    const validMotherPositions = [
      "First Wife",
      "Second Wife",
      "Third Wife",
      "Fourth Wife",
      "other",
    ];
    if (!validMotherPositions.includes(req.body.motherPosition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mother's position",
      });
    }

    // Validate parents' status
    const validParentStatuses = [
      "Living Together",
      "Living Apart",
      "Separated",
      "Divorced",
    ];
    if (!validParentStatuses.includes(req.body.parentsStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parents' status",
      });
    }

    // Update student's family structure
    student.familyStructure = {
      ...req.body,
      completed: true,
    };

    // Mark family structure as completed
    student.profileStatus.familyStructure = true;

    // Check if all sections are completed
    student.profileComplete = Object.values(student.profileStatus).every(
      (status) => status === true
    );

    await student.save();
    const formattedStudent = formatStudentDates(student);

    res.status(200).json({
      success: true,
      message: "Family structure updated successfully",
      data: {
        familyStructure: formattedStudent.familyStructure,
        profileStatus: formattedStudent.profileStatus,
        profileComplete: formattedStudent.profileComplete,
      },
    });
  } catch (error) {
    console.error("Error updating family structure:", error);
    res.status(500).json({
      success: false,
      message: "Error updating family structure",
      error: error.message,
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

    const validateSchoolYears = (admissionYear, graduationYear, schoolType) => {
      if (admissionYear && graduationYear) {
        if (isNaN(admissionYear) || isNaN(graduationYear)) {
          throw new Error(
            `${schoolType}: Admission and graduation years must be numbers`
          );
        }
        const currentYear = new Date().getFullYear();
        if (admissionYear < 1900 || admissionYear > currentYear) {
          throw new Error(`${schoolType}: Invalid admission year`);
        }
        if (graduationYear < 1900 || graduationYear > currentYear) {
          throw new Error(`${schoolType}: Invalid graduation year`);
        }
        if (admissionYear > graduationYear) {
          throw new Error(
            `${schoolType}: Admission year must be before graduation year`
          );
        }
      }
    };

    try {
      validateSchoolYears(
        req.body.schools?.primaryAdmissionYear,
        req.body.schools?.primaryGraduationYear,
        "Primary School"
      );
      validateSchoolYears(
        req.body.schools?.juniorSecondaryAdmissionYear,
        req.body.schools?.juniorSecondaryGraduationYear,
        "Junior Secondary School"
      );
      validateSchoolYears(
        req.body.schools?.seniorSecondaryAdmissionYear,
        req.body.schools?.seniorSecondaryGraduationYear,
        "Senior Secondary School"
      );
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    const educationalBackground = {
      schools: {
        primary: {},
        juniorSecondary: {},
        seniorSecondary: {},
      },
      completed: true,
    };

    Object.entries(req.body).forEach(([key, value]) => {
      if (key.startsWith("primary")) {
        const fieldName =
          key.replace("primary", "").charAt(0).toLowerCase() +
          key.replace("primary", "").slice(1);
        educationalBackground.schools.primary[fieldName] = value;
      } else if (key.startsWith("junior")) {
        const fieldName =
          key.replace("junior", "").charAt(0).toLowerCase() +
          key.replace("junior", "").slice(1);
        educationalBackground.schools.juniorSecondary[fieldName] = value;
      } else if (key.startsWith("senior")) {
        const fieldName =
          key.replace("senior", "").charAt(0).toLowerCase() +
          key.replace("senior", "").slice(1);
        educationalBackground.schools.seniorSecondary[fieldName] = value;
      }
    });

    student.educationalBackground = educationalBackground;
    student.profileStatus.educationalBackground = true;
    student.profileComplete = Object.values(student.profileStatus).every(
      (status) => status === true
    );
console.log("STUDENTSS!!!!!!!!!", student.educationalBackground);
console.log("ORDINARY!!!!!!!!!", educationalBackground);

    await student.save();
    const formattedStudent = formatStudentDates(
      await Student.findById(req.user.id)
    );

    res.status(200).json({
      success: true,
      message: "Educational background updated successfully",
      data: {
        educationalBackground: formattedStudent.educationalBackground,
        profileStatus: formattedStudent.profileStatus,
        profileComplete: formattedStudent.profileComplete,
      },
    });
  } catch (error) {
    console.error("Error updating educational background:", error);
    res.status(500).json({
      success: false,
      message: "Error updating educational background",
      error: error.message,
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

    // Check if all required sections are completed (excluding notes)
    const requiredSections = {
      personalData: student.profileStatus.personalData,
      familyBackground: student.profileStatus.familyBackground,
      familyStructure: student.profileStatus.familyStructure,
      educationalBackground: student.profileStatus.educationalBackground,
    };

    student.profileComplete = Object.values(requiredSections).every(status => status === true);

    await student.save();
    const formattedStudent = formatStudentDates(student);

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      data: {
        notes: formattedStudent.notes,
        profileStatus: {
          profileComplete: formattedStudent.profileComplete,
          completedSections: {
            ...requiredSections,
            notes: formattedStudent.profileStatus.notes,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
