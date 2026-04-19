import { DoctorsService } from "../services/doctors.js";
import logger from "../utils/logger.js";

export class DoctorsController {
  static async getAllDoctors(req, res) {
    try {
      const doctors = await DoctorsService.getAllDoctors();
      logger.info("Fetched all doctors", { count: doctors.length });
      res.status(200).json({ success: true, data: doctors });
    } catch (error) {
      logger.error("Error fetching doctors", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = await DoctorsService.getDoctorById(Number(id));
      if (!doctor) {
        logger.warn("Doctor not found", { id });
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      logger.info("Fetched doctor", { id });
      res.json({ success: true, data: doctor });
    } catch (error) {
      logger.error("Error fetching doctor", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createDoctor(req, res) {
    try {
      const {
        user_id,
        last_name,
        first_name,
        middle_name,
        department_id,
        room_id,
        slot_duration_override,
        is_active,
      } = req.body;

      if (!last_name || !first_name) {
        logger.warn("Missing required fields for doctor creation");
        return res
          .status(400)
          .json({ success: false, message: "last_name and first_name are required" });
      }

      const newDoctor = await DoctorsService.createDoctor({
        user_id,
        last_name,
        first_name,
        middle_name,
        department_id,
        room_id,
        slot_duration_override,
        is_active,
      });
      logger.info("Doctor created", { id: newDoctor.id, last_name: newDoctor.last_name });
      res.status(201).json({ success: true, data: newDoctor });
    } catch (error) {
      logger.error("Error creating doctor", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const {
        user_id,
        last_name,
        first_name,
        middle_name,
        department_id,
        room_id,
        slot_duration_override,
        is_active,
      } = req.body;

      const payload = {
        user_id,
        last_name,
        first_name,
        middle_name,
        department_id,
        room_id,
        slot_duration_override,
        is_active,
      };

      const dataToUpdate = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(dataToUpdate).length === 0) {
        logger.warn("No valid fields provided for doctor update", { id });
        return res.status(400).json({
          success: false,
          message:
            "Provide at least one field to update: user_id, last_name, first_name, middle_name, department_id, room_id, slot_duration_override, is_active",
        });
      }

      const updatedDoctor = await DoctorsService.updateDoctor(Number(id), dataToUpdate);

      if (!updatedDoctor) {
        logger.warn("Doctor not found for update", { id });
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      logger.info("Doctor updated", { id, last_name: updatedDoctor.last_name });
      res.json({ success: true, data: updatedDoctor });
    } catch (error) {
      logger.error("Error updating doctor", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      const deletedDoctor = await DoctorsService.deleteDoctor(Number(id));

      if (!deletedDoctor) {
        logger.warn("Doctor not found for deletion", { id });
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      logger.info("Doctor deleted", { id, last_name: deletedDoctor.last_name });
      res.json({ success: true, data: deletedDoctor });
    } catch (error) {
      logger.error("Error deleting doctor", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
