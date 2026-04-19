import { PatientsService } from "../services/patients.js";
import logger from "../utils/logger.js";

export class PatientsController {
  static async getAllPatients(req, res) {
    try {
      const patients = await PatientsService.getAllPatients();
      logger.info("Fetched all patients", { count: patients.length });
      res.status(200).json({ success: true, data: patients });
    } catch (error) {
      logger.error("Error fetching patients", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPatientById(req, res) {
    try {
      const { id } = req.params;
      const patient = await PatientsService.getPatientById(Number(id));
      if (!patient) {
        logger.warn("Patient not found", { id });
        return res.status(404).json({ success: false, message: "Patient not found" });
      }
      logger.info("Fetched patient", { id });
      res.json({ success: true, data: patient });
    } catch (error) {
      logger.error("Error fetching patient", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createPatient(req, res) {
    try {
      const { last_name, first_name, middle_name, date_of_birth, phone, email } = req.body;

      if (!last_name || !first_name) {
        logger.warn("Missing required fields for patient creation");
        return res
          .status(400)
          .json({ success: false, message: "last_name and first_name are required" });
      }

      const newPatient = await PatientsService.createPatient({
        last_name,
        first_name,
        middle_name,
        date_of_birth,
        phone,
        email,
      });
      logger.info("Patient created", { id: newPatient.id, last_name: newPatient.last_name });
      res.status(201).json({ success: true, data: newPatient });
    } catch (error) {
      logger.error("Error creating patient", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updatePatient(req, res) {
    try {
      const { id } = req.params;
      const { last_name, first_name, middle_name, date_of_birth, phone, email } = req.body;

      const payload = { last_name, first_name, middle_name, date_of_birth, phone, email };

      const dataToUpdate = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(dataToUpdate).length === 0) {
        logger.warn("No valid fields provided for patient update", { id });
        return res.status(400).json({
          success: false,
          message:
            "Provide at least one field to update: last_name, first_name, middle_name, date_of_birth, phone, email",
        });
      }

      const updatedPatient = await PatientsService.updatePatient(Number(id), dataToUpdate);

      if (!updatedPatient) {
        logger.warn("Patient not found for update", { id });
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      logger.info("Patient updated", { id, last_name: updatedPatient.last_name });
      res.json({ success: true, data: updatedPatient });
    } catch (error) {
      logger.error("Error updating patient", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deletePatient(req, res) {
    try {
      const { id } = req.params;
      const deletedPatient = await PatientsService.deletePatient(Number(id));

      if (!deletedPatient) {
        logger.warn("Patient not found for deletion", { id });
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      logger.info("Patient deleted", { id, last_name: deletedPatient.last_name });
      res.json({ success: true, data: deletedPatient });
    } catch (error) {
      logger.error("Error deleting patient", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
