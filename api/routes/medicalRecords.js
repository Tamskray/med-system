import { Router } from "express";
import { MedicalRecordsController } from "../controllers/medicalRecords.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get(
  "/",
  requirePermission("medical_records", "read"),
  MedicalRecordsController.getMedicalRecords,
);
router.post(
  "/",
  requirePermission("medical_records", "create"),
  MedicalRecordsController.createMedicalRecord,
);

export default router;
