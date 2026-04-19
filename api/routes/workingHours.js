import express from "express";
import { WorkingHoursController } from "../controllers/workingHours.js";

const router = express.Router();

// GET working hours for a specific doctor
router.get("/:doctorId", WorkingHoursController.getWorkingHours);

// UPSERT working hours for a specific doctor
router.post("/:doctorId", WorkingHoursController.upsertWorkingHours);

export default router;
