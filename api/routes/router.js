import { Router } from "express";
import doctorsRoutes from "./doctors.js";
import departmentsRoutes from "./departments.js";
import roomsRoutes from "./rooms.js";
import patientsRoutes from "./patients.js";

const router = Router();

// Aggregate all routes
router.use("/doctors", doctorsRoutes);
router.use("/departments", departmentsRoutes);
router.use("/rooms", roomsRoutes);
router.use("/patients", patientsRoutes);

export default router;
