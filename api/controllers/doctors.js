import { DoctorsService } from "../services/doctors.js";
import logger from "../utils/logger.js";

export class DoctorsController {
  static async getAllDoctors(req, res) {
    try {
      const doctors = await DoctorsService.getAllDoctors();
      logger.info("Fetched all doctors", { count: doctors.length });
      //   res.json({ success: true, data: doctors });
      console.log("CONTROLLER DOCTORS:", doctors);
      res.status(200).json(doctors);
    } catch (error) {
      logger.error("Error fetching doctors", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = DoctorsService.getDoctorById(Number(id));
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

  static createDoctor(req, res) {
    try {
      const { name, specialty, experience, contact } = req.body;

      if (!name || !specialty || !experience || !contact) {
        logger.warn("Missing required fields for doctor creation");
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const newDoctor = DoctorsService.createDoctor({ name, specialty, experience, contact });
      logger.info("Doctor created", { id: newDoctor.id, name: newDoctor.name });
      res.status(201).json({ success: true, data: newDoctor });
    } catch (error) {
      logger.error("Error creating doctor", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const { name, specialty, experience, contact } = req.body;

      if (!name || !specialty || !experience || !contact) {
        logger.warn("Missing required fields for doctor update", { id });
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const updatedDoctor = DoctorsService.updateDoctor(Number(id), {
        name,
        specialty,
        experience,
        contact,
      });

      if (!updatedDoctor) {
        logger.warn("Doctor not found for update", { id });
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      logger.info("Doctor updated", { id, name: updatedDoctor.name });
      res.json({ success: true, data: updatedDoctor });
    } catch (error) {
      logger.error("Error updating doctor", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      const deletedDoctor = DoctorsService.deleteDoctor(Number(id));

      if (!deletedDoctor) {
        logger.warn("Doctor not found for deletion", { id });
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      logger.info("Doctor deleted", { id, name: deletedDoctor.name });
      res.json({ success: true, data: deletedDoctor });
    } catch (error) {
      logger.error("Error deleting doctor", { id: req.params.id, message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
