import express from "express";
import {
  createAppointment,
  getCounselorAppointments,
  getStudentAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";
import {  authorize } from "../middleware/auth.js";

const router = express.Router();

// Create appointment (counselor only)
router.post(
  "/",
  
  authorize(["counselor"]),
  createAppointment
);

// Get counselor's appointments
router.get(
  "/counselor",
  
  authorize(["counselor"]),
  getCounselorAppointments
);

// Get student's appointments
router.get(
  "/student",
  
  authorize(["student"]),
  getStudentAppointments
);

// Get single appointment
router.get(
  "/:id",
  
  authorize(["counselor", "student"]),
  getAppointment
);

// Update appointment
router.put(
  "/:id",
  
  authorize(["counselor", "student"]),
  updateAppointment
);

// Delete appointment
router.delete(
  "/:id",
  
  authorize(["counselor", "student"]),
  deleteAppointment
);

export default router;
