import mongoose from "mongoose";

// Personal Data Schema
const personalDataSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female']
  },
  admissionNumber: {
    type: String,
    required: [true, 'Admission number is required'],
    trim: true
  },
  yearOfAdmission: {
    type: Number,
    required: [true, 'Year of admission is required']
  },
  collegeHouse: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  placeOfBirth: {
    type: String,
    required: [true, 'Place of birth is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Permanent home address is required'],
    trim: true
  },
  contactAddress: {
    type: String,
    required: [true, 'Contact address is required'],
    trim: true
  },
  stateOfOrigin: {
    type: String,
    required: [true, 'State of origin is required'],
    trim: true
  },
  languagesSpoken: {
    type: String,
    trim: true
  },
  countriesVisited: {
    type: String,
    trim: true
  },
  religion: {
    type: String,
    required: [true, 'Religion is required'],
    trim: true
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true
  },
  changeOfName: {
    type: String,
    trim: true
  },
  changeOfNameDate: {
    type: Date
  },
  evidence: {
    type: String // This will store the file path or URL
  }
}, { _id: false });

// Family Background Schema
const familyBackgroundSchema = new mongoose.Schema(
  {
    parents: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true }, // e.g., "Father", "Mother", "Guardian"
        occupation: { type: String, required: true },
        education: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String },
        isAlive: { type: Boolean, default: true },
        isMarried: { type: Boolean, default: true },
        additionalInfo: { type: String },
      },
    ],
    familyIncome: { type: String, required: true },
    familySize: { type: Number, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Family Structure Schema
const familyStructureSchema = new mongoose.Schema(
  {
    siblings: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        relationship: { type: String, required: true },
        occupation: { type: String },
        education: { type: String },
      },
    ],
    livingWith: { type: String, required: true },
    familyType: { type: String, required: true },
    familyChallenges: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Educational Background Schema
const educationalBackgroundSchema = new mongoose.Schema(
  {
    schools: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          required: true,
          enum: ["Primary", "Junior Secondary", "Senior Secondary"],
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        currentSchool: { type: Boolean, default: false },
        reasonForLeaving: { type: String },
        achievements: [{ type: String }],
        challenges: [{ type: String }],
      },
    ],
    currentGrade: { type: String, required: true },
    academicPerformance: { type: String, required: true },
    favoriteSubjects: [{ type: String }],
    challengingSubjects: [{ type: String }],
    extracurricularActivities: [{ type: String }],
    awards: [{ type: String }],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

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
      notes: { type: Boolean, default: false }
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
