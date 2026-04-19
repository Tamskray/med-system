import { Router } from "express";
import doctorsRoutes from "./doctors.js";
import departmentsRoutes from "./departments.js";
import roomsRoutes from "./rooms.js";

const router = Router();

// Aggregate all routes
router.use("/doctors", doctorsRoutes);
router.use("/departments", departmentsRoutes);
router.use("/rooms", roomsRoutes);

export default router;
