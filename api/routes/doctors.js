import { Router } from "express";
import { DoctorsController } from "../controllers/doctors.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get("/", requirePermission("doctors", "read"), DoctorsController.getAllDoctors);
router.get("/time-offs", requirePermission("doctors", "read"), DoctorsController.getTimeOffs);
router.get(
  "/:id/time-off-conflicts",
  requirePermission("doctors", "read"),
  DoctorsController.getDoctorTimeOffConflicts,
);
router.get("/:id", requirePermission("doctors", "read"), DoctorsController.getDoctorById);
router.post("/", requirePermission("doctors", "create"), DoctorsController.createDoctor);
router.post(
  "/:id/time-offs",
  requirePermission("doctors", "update"),
  DoctorsController.createDoctorTimeOff,
);
router.put("/:id", requirePermission("doctors", "update"), DoctorsController.updateDoctor);
router.delete("/:id", requirePermission("doctors", "delete"), DoctorsController.deleteDoctor);

export default router;
