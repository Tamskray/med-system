import { MedicalRecordsService } from "../services/medicalRecords.js";
import logger from "../utils/logger.js";

export class MedicalRecordsController {
  static async getMedicalRecords(req, res) {
    try {
      const { patient_id } = req.query;
      const records = await MedicalRecordsService.getMedicalRecords({ patientId: patient_id });

      logger.info("Fetched medical records", {
        count: records.length,
        patient_id: patient_id || null,
      });

      res.status(200).json({ success: true, data: records });
    } catch (error) {
      logger.error("Error fetching medical records", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createMedicalRecord(req, res) {
    try {
      const {
        patient_id,
        doctor_id,
        appointment_id,
        symptoms,
        diagnosis,
        prescription_notes,
        attachments,
      } = req.body;

      if (!patient_id || !diagnosis) {
        logger.warn("Missing required fields for medical record creation");
        return res.status(400).json({
          success: false,
          message: "patient_id and diagnosis are required",
        });
      }

      const newRecord = await MedicalRecordsService.createMedicalRecord({
        patient_id,
        doctor_id,
        appointment_id,
        symptoms,
        diagnosis,
        prescription_notes,
        attachments,
      });

      logger.info("Medical record created", {
        id: newRecord.id,
        patient_id: newRecord.patient_id,
      });

      res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
      logger.error("Error creating medical record", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
