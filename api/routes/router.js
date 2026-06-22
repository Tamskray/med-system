import { Router } from "express";
import doctorsRoutes from "./doctors.js";
import departmentsRoutes from "./departments.js";
import roomsRoutes from "./rooms.js";
import patientsRoutes from "./patients.js";
import appointmentsRoutes from "./appointments.js";
import workingHoursRoutes from "./workingHours.js";
import medicalRecordsRoutes from "./medicalRecords.js";
import usersRoutes from "./users.js";
import authRoutes from "./authRoutes.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Aggregate all routes
router.use("/auth", authRoutes);
router.use(verifyToken);
router.use("/doctors", doctorsRoutes);
router.use("/departments", departmentsRoutes);
router.use("/rooms", roomsRoutes);
router.use("/patients", patientsRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/working-hours", workingHoursRoutes);
router.use("/medical-records", medicalRecordsRoutes);
router.use("/users", usersRoutes);

export default router;
