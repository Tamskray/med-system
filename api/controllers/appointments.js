import { AppointmentsService, AppointmentValidationError } from "../services/appointments.js";
import { sseService } from "../services/sseService.js";
import { supabase } from "../supabase.js";
import logger from "../utils/logger.js";

export class AppointmentsController {
  static streamAppointments(req, res) {
    sseService.addClient(req, res);
  }

  static async getAllAppointments(req, res) {
    try {
      const { date, doctor_id, patient_id } = req.query;
      const appointments = await AppointmentsService.getAllAppointments({
        date,
        doctorId: doctor_id,
        patientId: patient_id,
      });
      logger.info("Fetched appointments", {
        count: appointments.length,
        date: date || null,
        doctor_id: doctor_id || null,
        patient_id: patient_id || null,
      });
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
      sseService.broadcast("CREATE", newAppointment);
      res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
      logger.error("Error creating appointment", { message: error.message });
      if (error instanceof AppointmentValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
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

      if (dataToUpdate.status !== undefined) {
        sseService.broadcast("UPDATE_STATUS", updatedAppointment);
      }

      res.json({ success: true, data: updatedAppointment });
    } catch (error) {
      logger.error("Error updating appointment", { id: req.params.id, message: error.message });
      if (error instanceof AppointmentValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      const { data: existingAppointment, error: lookupError } = await supabase
        .from("appointments")
        .select("id")
        .eq("id", id)
        .single();

      if (lookupError || !existingAppointment) {
        logger.warn("Appointment not found for deletion", { id });
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      await AppointmentsService.deleteAppointment(Number(id));
      logger.info("Appointment deleted", { id });
      sseService.broadcast("DELETE", { id: Number(id) });
      res.status(200).json({ success: true, message: "Appointment deleted" });
    } catch (error) {
      logger.error("Error deleting appointment", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
