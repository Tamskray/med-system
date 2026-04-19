import { Router } from "express";
import { AppointmentsController } from "../controllers/appointments.js";

const router = Router();

router.get("/", AppointmentsController.getAllAppointments);
router.post("/", AppointmentsController.createAppointment);
router.put("/:id", AppointmentsController.updateAppointment);

export default router;
