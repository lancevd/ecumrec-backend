import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    start: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    end: {
      type: Date,
      required: [true, "Please provide an end date"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Please provide a student ID"],
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: [true, "Please provide a counselor ID"],
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "Please provide a school ID"],
    },
    type: {
      type: String,
      enum: ["counseling", "assessment", "other"],
      required: [true, "Please provide an appointment type"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
    },
    backgroundColor: {
      type: String,
      default: "#184C85",
    },
    borderColor: {
      type: String,
      default: "#184C85",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient querying
appointmentSchema.index({ studentId: 1, start: 1 });
appointmentSchema.index({ counselorId: 1, start: 1 });
appointmentSchema.index({ schoolId: 1, start: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment; 