import { Router } from "express";
import { PatientsController } from "../controllers/patients.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get("/", requirePermission("patients", "read"), PatientsController.getAllPatients);
router.get("/:id", requirePermission("patients", "read"), PatientsController.getPatientById);
router.post("/", requirePermission("patients", "create"), PatientsController.createPatient);
router.put("/:id", requirePermission("patients", "update"), PatientsController.updatePatient);
router.delete("/:id", requirePermission("patients", "delete"), PatientsController.deletePatient);

export default router;
