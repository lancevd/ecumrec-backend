import mongoose from "mongoose";

// Physical Development Schema
const physicalDevelopmentSchema = new mongoose.Schema({
  height: { type: Number },
  weight: { type: Number },
  otherFeatures: { type: String }
});

// Physical Disabilities Schema
const physicalDisabilitiesSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  partialDeafness: { type: Boolean, default: false },
  partialBlindness: { type: Boolean, default: false },
  shortSightedness: { type: Boolean, default: false },
  longSightedness: { type: Boolean, default: false },
  stammering: { type: Boolean, default: false },
  squinting: { type: Boolean, default: false },
  physicalImpairment: { type: Boolean, default: false },
  other: { type: String }
});

// Health Records Schema
const healthRecordsSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  natureOfProblem: { type: String },
  causes: { type: String },
  referrals: { type: String }
});

// Discipline Records Schema
const disciplineRecordsSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  records: [{
    date: { type: Date, required: true },
    offence: { type: String, required: true },
    actionTaken: { type: String, required: true }
  }]
});

// Standardized Tests Schema
const standardizedTestsSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  tests: [{
    testName: { type: String, required: true },
    testDescription: { type: String, required: true },
    score: { type: String, required: true },
    interpretation: { type: String, required: true },
    discussion: { type: String },
    date: { type: Date, required: true }
  }]
});

// Academic Records Schema
const academicRecordsSchema = new mongoose.Schema({
  classes: [{
    name: { type: String, required: true },
    subjects: [{
      name: { type: String, required: true },
      score: { type: Number, required: true }
    }]
  }]
});

// Observations Schema
const observationsSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  punctuality: { type: Number, min: 1, max: 5 },
  attendance: { type: Number, min: 1, max: 5 },
  reliability: { type: Number, min: 1, max: 5 },
  politeness: { type: Number, min: 1, max: 5 },
  honesty: { type: Number, min: 1, max: 5 },
  relationshipWithStaff: { type: Number, min: 1, max: 5 },
  relationshipWithPeers: { type: Number, min: 1, max: 5 },
  selfControl: { type: Number, min: 1, max: 5 },
  cooperation: { type: Number, min: 1, max: 5 },
  attentiveness: { type: Number, min: 1, max: 5 },
  initiative: { type: Number, min: 1, max: 5 },
  organization: { type: Number, min: 1, max: 5 },
  perseverance: { type: Number, min: 1, max: 5 },
  senseOfLeadership: { type: Number, min: 1, max: 5 },
  respectForAuthority: { type: Number, min: 1, max: 5 },
  senseOfResponsibility: { type: Number, min: 1, max: 5 },
  industry: { type: Number, min: 1, max: 5 },
  games: { type: Number, min: 1, max: 5 },
  sports: { type: Number, min: 1, max: 5 },
  gymnastics: { type: Number, min: 1, max: 5 },
  handlingOfTools: { type: Number, min: 1, max: 5 },
  drawingPainting: { type: Number, min: 1, max: 5 },
  craft: { type: Number, min: 1, max: 5 },
  musicalSkills: { type: Number, min: 1, max: 5 },
  speechFluency: { type: Number, min: 1, max: 5 },
  handlingOfLaboratoryEquipment: { type: Number, min: 1, max: 5 }
});

// Vocational Interests Schema
const vocationalInterestsSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  interests: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    counselorComments: { type: String }
  }]
});

// Main Assessment Schema
const assessmentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counselor",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  status: {
    type: String,
    enum: ["ongoing", "false", "completed"],
    default: "ongoing"
  },
  physicalDevelopment: { type: physicalDevelopmentSchema },
  physicalDisabilities: { type: physicalDisabilitiesSchema },
  healthRecords: { type: healthRecordsSchema },
  disciplineRecords: { type: disciplineRecordsSchema },
  standardizedTests: { type: standardizedTestsSchema },
  academicRecords: { type: academicRecordsSchema },
  observations: { type: observationsSchema },
  vocationalInterests: { type: vocationalInterestsSchema },
  overallRemark: {
    remark: { type: String }
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
assessmentSchema.index({ schoolId: 1 });
assessmentSchema.index({ counselorId: 1 });
assessmentSchema.index({ studentId: 1 });
assessmentSchema.index({ status: 1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment; 