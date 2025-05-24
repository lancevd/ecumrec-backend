import mongoose from "mongoose";

// Personal Data Schema
const personalDataSchema = new mongoose.Schema({
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  placeOfBirth: { type: String, required: true },
  nationality: { type: String, required: true },
  religion: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  healthConditions: { type: String },
  allergies: { type: String },
  disabilities: { type: String },
  hobbies: { type: String },
  interests: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Family Background Schema
const familyBackgroundSchema = new mongoose.Schema({
  parents: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true }, // e.g., "Father", "Mother", "Guardian"
    occupation: { type: String, required: true },
    education: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    isAlive: { type: Boolean, default: true },
    isMarried: { type: Boolean, default: true },
    additionalInfo: { type: String }
  }],
  familyIncome: { type: String, required: true },
  familySize: { type: Number, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Family Structure Schema
const familyStructureSchema = new mongoose.Schema({
  siblings: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    relationship: { type: String, required: true },
    occupation: { type: String },
    education: { type: String }
  }],
  livingWith: { type: String, required: true },
  familyType: { type: String, required: true },
  familyChallenges: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Educational Background Schema
const educationalBackgroundSchema = new mongoose.Schema({
  schools: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      required: true,
      enum: ["Primary", "Junior Secondary", "Senior Secondary"]
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    currentSchool: { type: Boolean, default: false },
    reasonForLeaving: { type: String },
    achievements: [{ type: String }],
    challenges: [{ type: String }]
  }],
  currentGrade: { type: String, required: true },
  academicPerformance: { type: String, required: true },
  favoriteSubjects: [{ type: String }],
  challengingSubjects: [{ type: String }],
  extracurricularActivities: [{ type: String }],
  awards: [{ type: String }],
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Notes Schema
const notesSchema = new mongoose.Schema({
  personalNotes: { type: String },
  counselorNotes: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Main Student Schema
const studentSchema = new mongoose.Schema({
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
  personalData: { type: personalDataSchema },
  familyBackground: { type: familyBackgroundSchema },
  familyStructure: { type: familyStructureSchema },
  educationalBackground: { type: educationalBackgroundSchema },
  notes: { type: notesSchema }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
