import { Router } from "express";
import { AppointmentsController } from "../controllers/appointments.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get(
  "/stream",
  requirePermission("appointments", "read"),
  AppointmentsController.streamAppointments,
);
router.get(
  "/",
  requirePermission("appointments", "read"),
  AppointmentsController.getAllAppointments,
);
router.post(
  "/",
  requirePermission("appointments", "create"),
  AppointmentsController.createAppointment,
);
router.put(
  "/:id",
  requirePermission("appointments", "update"),
  AppointmentsController.updateAppointment,
);
router.delete(
  "/:id",
  requirePermission("appointments", "update"),
  AppointmentsController.deleteAppointment,
);

export default router;
