import { AppointmentsService } from "../services/appointments.js";
import logger from "../utils/logger.js";

export class AppointmentsController {
  static async getAllAppointments(req, res) {
    try {
      const { date } = req.query;
      const appointments = await AppointmentsService.getAllAppointments({ date });
      logger.info("Fetched appointments", { count: appointments.length, date: date || null });
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      logger.error("Error fetching appointments", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createAppointment(req, res) {
    try {
      const {
        doctor_id,
        patient_id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        status,
        cancellation_reason,
        notes,
      } = req.body;

      if (!doctor_id || !appointment_date || !start_time || !end_time) {
        logger.warn("Missing required fields for appointment creation");
        return res.status(400).json({
          success: false,
          message: "doctor_id, appointment_date, start_time, and end_time are required",
        });
      }

      const newAppointment = await AppointmentsService.createAppointment({
        doctor_id,
        patient_id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        status,
        cancellation_reason,
        notes,
      });

      logger.info("Appointment created", {
        id: newAppointment.id,
        doctor_id: newAppointment.doctor_id,
        appointment_date: newAppointment.appointment_date,
      });
      res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
      logger.error("Error creating appointment", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const {
        patient_id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        status,
        cancellation_reason,
        notes,
      } = req.body;

      const payload = {
        patient_id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        status,
        cancellation_reason,
        notes,
      };

      const dataToUpdate = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(dataToUpdate).length === 0) {
        logger.warn("No valid fields provided for appointment update", { id });
        return res.status(400).json({
          success: false,
          message:
            "Provide at least one field to update: patient_id, appointment_date, start_time, end_time, appointment_type, status, cancellation_reason, notes",
        });
      }

      const updatedAppointment = await AppointmentsService.updateAppointment(
        Number(id),
        dataToUpdate,
      );

      if (!updatedAppointment) {
        logger.warn("Appointment not found for update", { id });
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      logger.info("Appointment updated", { id, status: updatedAppointment.status });
      res.json({ success: true, data: updatedAppointment });
    } catch (error) {
      logger.error("Error updating appointment", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
