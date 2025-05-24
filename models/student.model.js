import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
  dateOfBirth: { type: Date, required: true },
  grade: { type: String, required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
