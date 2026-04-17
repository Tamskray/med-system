import { Router } from "express";
import doctorsRoutes from "./doctors.js";

const router = Router();

// Aggregate all routes
router.use("/doctors", doctorsRoutes);

export default router;
