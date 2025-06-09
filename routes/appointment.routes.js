const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");
const { protect } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");

// Counselor routes
router
  .route("/counselor")
  .get(
    protect,
    checkRole(["staff"]),
    appointmentController.getCounselorAppointments
  );

router
  .route("/counselor/:id")
  .get(protect, checkRole(["staff"]), appointmentController.getAppointment)
  .put(protect, checkRole(["staff"]), appointmentController.updateAppointment)
  .delete(
    protect,
    checkRole(["staff"]),
    appointmentController.deleteAppointment
  );

// Student routes
router
  .route("/student")
  .get(
    protect,
    checkRole(["student"]),
    appointmentController.getStudentAppointments
  );

router
  .route("/student/:id")
  .get(protect, checkRole(["student"]), appointmentController.getAppointment)
  .put(protect, checkRole(["student"]), appointmentController.updateAppointment)
  .delete(
    protect,
    checkRole(["student"]),
    appointmentController.deleteAppointment
  );

// Common routes
router
  .route("/")
  .post(
    protect,
    checkRole(["staff", "student"]),
    appointmentController.createAppointment
  );

module.exports = router;
