import { Router } from "express";
import { PatientsController } from "../controllers/patients.js";

const router = Router();

router.get("/", PatientsController.getAllPatients);
router.get("/:id", PatientsController.getPatientById);
router.post("/", PatientsController.createPatient);
router.put("/:id", PatientsController.updatePatient);
router.delete("/:id", PatientsController.deletePatient);

export default router;
