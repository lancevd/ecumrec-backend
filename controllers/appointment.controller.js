const Appointment = require("../models/appointment.model");
const { validateObjectId } = require("../utils/validators");

// Helper function to format dates
const formatAppointmentDates = (appointment) => {
  const formatted = appointment.toObject();
  formatted.start = new Date(formatted.start).toISOString().split('T')[0];
  formatted.end = new Date(formatted.end).toISOString().split('T')[0];
  return formatted;
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { title, start, end, studentId, type, notes } = req.body;

    // Validate required fields
    if (!title || !start || !end || !studentId || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      title,
      start,
      end,
      studentId,
      counselorId: req.user.id,
      schoolId: req.user.schoolId,
      type,
      notes,
    });

    const formattedAppointment = formatAppointmentDates(appointment);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: formattedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating appointment",
    });
  }
};

// Get all appointments for a counselor
exports.getCounselorAppointments = async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { counselorId: req.user.id };

    // Add date range filter if provided
    if (start && end) {
      query.start = { $gte: new Date(start) };
      query.end = { $lte: new Date(end) };
    }

    const appointments = await Appointment.find(query)
      .populate("studentId", "firstName lastName")
      .sort({ start: 1 });

    const formattedAppointments = appointments.map(formatAppointmentDates);

    res.status(200).json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching appointments",
    });
  }
};

// Get all appointments for a student
exports.getStudentAppointments = async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { studentId: req.user.id };

    // Add date range filter if provided
    if (start && end) {
      query.start = { $gte: new Date(start) };
      query.end = { $lte: new Date(end) };
    }

    const appointments = await Appointment.find(query)
      .populate("counselorId", "firstName lastName")
      .sort({ start: 1 });

    const formattedAppointments = appointments.map(formatAppointmentDates);

    res.status(200).json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching appointments",
    });
  }
};

// Get a single appointment
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("studentId", "firstName lastName")
      .populate("counselorId", "firstName lastName");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const formattedAppointment = formatAppointmentDates(appointment);

    res.status(200).json({
      success: true,
      data: formattedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching appointment",
    });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start, end, type, status, notes } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user is authorized to update
    if (
      appointment.counselorId.toString() !== req.user.id &&
      appointment.studentId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        title,
        start,
        end,
        type,
        status,
        notes,
      },
      { new: true }
    )
      .populate("studentId", "firstName lastName")
      .populate("counselorId", "firstName lastName");

    const formattedAppointment = formatAppointmentDates(updatedAppointment);

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: formattedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating appointment",
    });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user is authorized to delete
    if (
      appointment.counselorId.toString() !== req.user.id &&
      appointment.studentId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this appointment",
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting appointment",
    });
  }
}; 