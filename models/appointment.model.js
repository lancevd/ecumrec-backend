const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    type: {
      type: String,
      enum: ["counseling", "workshop", "group"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
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

// Indexes for efficient querying
appointmentSchema.index({ studentId: 1, start: 1 });
appointmentSchema.index({ counselorId: 1, start: 1 });
appointmentSchema.index({ schoolId: 1, start: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment; 