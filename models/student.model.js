import mongoose from "mongoose";

// Personal Data Schema
const personalDataSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female"],
    },
    admissionNumber: {
      type: String,
      required: [true, "Admission number is required"],
      trim: true,
    },
    yearOfAdmission: {
      type: Number,
      required: [true, "Year of admission is required"],
    },
    collegeHouse: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    placeOfBirth: {
      type: String,
      required: [true, "Place of birth is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Permanent home address is required"],
      trim: true,
    },
    contactAddress: {
      type: String,
      required: [true, "Contact address is required"],
      trim: true,
    },
    stateOfOrigin: {
      type: String,
      required: [true, "State of origin is required"],
      trim: true,
    },
    languagesSpoken: {
      type: String,
      trim: true,
    },
    countriesVisited: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      trim: true,
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
    },
    changeOfName: {
      type: String,
      trim: true,
    },
    changeOfNameDate: {
      type: Date,
    },
    evidence: {
      type: String, // This will store the file path or URL
    },
  },
  { _id: false }
);

// Family Background Schema
const familyBackgroundSchema = new mongoose.Schema(
  {
    father: {
      name: { type: String },
      contactAddress: { type: String },
      residentialAddress: { type: String },
      phone: { type: String },
      state: { type: String },
      nationality: { type: String },
      religion: { type: String },
      educationLevel: { type: String },
      occupation: { type: String },
      deceased: { type: String },
      dateOfBirth: { type: Date },
    },
    mother: {
      name: { type: String },
      contactAddress: { type: String },
      residentialAddress: { type: String },
      phone: { type: String },
      state: { type: String },
      nationality: { type: String },
      religion: { type: String },
      educationLevel: { type: String },
      occupation: { type: String },
      deceased: { type: String },
      dateOfBirth: { type: Date },
    },
    guardian: {
      name: { type: String },
      contactAddress: { type: String },
      residentialAddress: { type: String },
      phone: { type: String },
      state: { type: String },
      nationality: { type: String },
      religion: { type: String },
      educationLevel: { type: String },
      occupation: { type: String },
      deceased: { type: String },
      dateOfBirth: { type: Date },
    },
  },
  { _id: false }
);

// Add a pre-save middleware to validate required fields only if the parent/guardian is provided
familyBackgroundSchema.pre("save", function (next) {
  const validateParentFields = (parent) => {
    if (parent && parent.name) {
      const requiredFields = [
        "name",
        "contactAddress",
        "residentialAddress",
        "phone",
        "state",
        "nationality",
        "religion",
        "educationLevel",
        "occupation",
        "deceased",
      ];

      const missingFields = requiredFields.filter((field) => !parent[field]);
      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields for ${parent.name}: ${missingFields.join(
            ", "
          )}`
        );
      }
    }
  };

  try {
    validateParentFields(this.father);
    validateParentFields(this.mother);
    validateParentFields(this.guardian);
    next();
  } catch (error) {
    next(error);
  }
});

// Family Structure Schema
const familyStructureSchema = new mongoose.Schema(
  {
    fatherWives: {
      type: Number,
      required: [true, "Father's number of wives is required"],
      min: [1, "Father must have at least 1 wife"],
    },
    motherPosition: {
      type: String,
      required: [true, "Mother's position is required"],
      enum: {
        values: [
          "First Wife",
          "Second Wife",
          "Third Wife",
          "Fourth Wife",
          "other",
        ],
        message:
          "Mother's position must be one of: First Wife, Second Wife, Third Wife, Fourth Wife, or other",
      },
    },
    totalSiblings: {
      type: Number,
      required: [true, "Total number of siblings is required"],
      min: [0, "Total siblings cannot be negative"],
    },
    maleSiblings: {
      type: Number,
      required: [true, "Number of male siblings is required"],
      min: [0, "Number of male siblings cannot be negative"],
    },
    femaleSiblings: {
      type: Number,
      required: [true, "Number of female siblings is required"],
      min: [0, "Number of female siblings cannot be negative"],
    },
    positionAmongSiblings: {
      type: Number,
      required: [true, "Position among siblings is required"],
      min: [1, "Position among siblings must be at least 1"],
    },
    parentsStatus: {
      type: String,
      required: [true, "Parents' status is required"],
      enum: {
        values: ["Living Together", "Living Apart", "Separated", "Divorced"],
        message:
          "Parents' status must be one of: Living Together, Living Apart, Separated, or Divorced",
      },
    },
    siblings: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        relationship: { type: String, required: true },
        occupation: { type: String },
        education: { type: String },
      },
    ],
    familyChallenges: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add a pre-save middleware to validate family structure data
familyStructureSchema.pre("save", function (next) {
  // Validate that total siblings equals sum of male and female siblings
  if (this.totalSiblings !== this.maleSiblings + this.femaleSiblings) {
    return next(
      new Error("Total siblings must equal the sum of male and female siblings")
    );
  }

  // Validate that position among siblings is not greater than total siblings
  if (this.positionAmongSiblings > this.totalSiblings) {
    return next(
      new Error("Position among siblings cannot be greater than total siblings")
    );
  }

  next();
});

// Educational Background Schema
// Sub-schema for each school level
const SchoolSchema = new mongoose.Schema({
  schoolName:        { type: String },
  admissionYear:     { type: Number },
  graduationYear:    { type: Number },
  leavingReason:     { type: String },
  certificateNumber: { type: String },
}, { _id: false });

// Educational background schema with three nested school sub-documents
const educationalBackgroundSchema = new mongoose.Schema({
  schools: {
    primary:         { type: SchoolSchema, default: {} },
    juniorSecondary: { type: SchoolSchema, default: {} },
    seniorSecondary: { type: SchoolSchema, default: {} },
  },
  completed:         { type: Boolean, default: false },
}, { timestamps: true });


// Add a pre-save middleware to validate educational background data
educationalBackgroundSchema.pre("save", function (next) {
  const validateSchoolYears = (admissionYear, graduationYear, schoolType) => {
    if (admissionYear && graduationYear) {
      if (admissionYear > graduationYear) {
        throw new Error(
          `${schoolType}: Admission year must be before graduation year`
        );
      }
    }
  };

  try {
    validateSchoolYears(
      this.schools.primaryAdmissionYear,
      this.schools.primaryGraduationYear,
      "Primary School"
    );
    validateSchoolYears(
      this.schools.juniorSecondaryAdmissionYear,
      this.schools.juniorSecondaryGraduationYear,
      "Junior Secondary School"
    );
    validateSchoolYears(
      this.schools.seniorSecondaryAdmissionYear,
      this.schools.seniorSecondaryGraduationYear,
      "Senior Secondary School"
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Notes Schema
const notesSchema = new mongoose.Schema(
  {
    additionalNotes: { type: String },
    counselorNotes: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Main Student Schema
const studentSchema = new mongoose.Schema(
  {
    // Account Creation Fields
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    role: { type: String, enum: ["student"], default: "student" },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },

    // Profile Fields
    profileComplete: { type: Boolean, default: false },
    profileStatus: {
      personalData: { type: Boolean, default: false },
      familyBackground: { type: Boolean, default: false },
      familyStructure: { type: Boolean, default: false },
      educationalBackground: { type: Boolean, default: false },
      notes: { type: Boolean, default: false },
    },
    personalData: { type: personalDataSchema },
    familyBackground: { type: familyBackgroundSchema },
    familyStructure: { type: familyStructureSchema },
    educationalBackground: { type: educationalBackgroundSchema },
    notes: { type: notesSchema },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
