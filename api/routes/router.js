import { Router } from "express";
import doctorsRoutes from "./doctors.js";
import departmentsRoutes from "./departments.js";
import roomsRoutes from "./rooms.js";
import patientsRoutes from "./patients.js";
import appointmentsRoutes from "./appointments.js";
import workingHoursRoutes from "./workingHours.js";

const router = Router();

// Aggregate all routes
router.use("/doctors", doctorsRoutes);
router.use("/departments", departmentsRoutes);
router.use("/rooms", roomsRoutes);
router.use("/patients", patientsRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/working-hours", workingHoursRoutes);

export default router;
