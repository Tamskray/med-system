import { Router } from "express";
import { DoctorsController } from "../controllers/doctors.js";

const router = Router();

router.get("/", DoctorsController.getAllDoctors);
router.get("/:id", DoctorsController.getDoctorById);
router.post("/", DoctorsController.createDoctor);
router.put("/:id", DoctorsController.updateDoctor);
router.delete("/:id", DoctorsController.deleteDoctor);

export default router;
