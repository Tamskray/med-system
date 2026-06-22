import express from "express";
import { WorkingHoursController } from "../controllers/workingHours.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = express.Router();

router.get(
  "/",
  requirePermission("doctor_schedule", "read"),
  WorkingHoursController.getWorkingHoursList,
);

router.get(
  "/:doctorId",
  requirePermission("doctor_schedule", "read"),
  WorkingHoursController.getWorkingHours,
);

router.post(
  "/:doctorId",
  requirePermission("doctor_schedule", "update"),
  WorkingHoursController.upsertWorkingHours,
);

export default router;
