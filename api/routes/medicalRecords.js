import { Router } from "express";
import { MedicalRecordsController } from "../controllers/medicalRecords.js";

const router = Router();

router.get("/", MedicalRecordsController.getMedicalRecords);
router.post("/", MedicalRecordsController.createMedicalRecord);

export default router;
