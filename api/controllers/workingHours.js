import { WorkingHoursService } from "../services/workingHours.js";
import logger from "../utils/logger.js";

export class WorkingHoursController {
  static async getWorkingHoursList(req, res) {
    try {
      const { doctorIds, dayOfWeek } = req.query;

      const normalizedDoctorIds = String(doctorIds || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      const normalizedDayOfWeek =
        dayOfWeek === undefined || dayOfWeek === null || dayOfWeek === ""
          ? undefined
          : Number(dayOfWeek);

      const workingHours = await WorkingHoursService.getWorkingHours({
        doctorIds: normalizedDoctorIds,
        dayOfWeek: Number.isFinite(normalizedDayOfWeek) ? normalizedDayOfWeek : undefined,
      });

      logger.info("Fetched working hours list", {
        doctorCount: normalizedDoctorIds.length,
        dayOfWeek: Number.isFinite(normalizedDayOfWeek) ? normalizedDayOfWeek : null,
        count: workingHours.length,
      });

      res.status(200).json({ success: true, data: workingHours });
    } catch (error) {
      logger.error("Error fetching working hours list", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWorkingHours(req, res) {
    try {
      const { doctorId } = req.params;

      if (!doctorId) {
        return res.status(400).json({ success: false, message: "Doctor ID is required" });
      }

      const workingHours = await WorkingHoursService.getWorkingHoursByDoctorId(doctorId);
      logger.info("Fetched working hours", { doctorId, count: workingHours.length });
      res.status(200).json({ success: true, data: workingHours });
    } catch (error) {
      logger.error("Error fetching working hours", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async upsertWorkingHours(req, res) {
    try {
      const { doctorId } = req.params;
      const { workingHours } = req.body;

      if (!doctorId) {
        return res.status(400).json({ success: false, message: "Doctor ID is required" });
      }

      const savedWorkingHours = await WorkingHoursService.upsertWorkingHours(
        doctorId,
        workingHours,
      );
      logger.info("Upserted working hours", { doctorId, count: savedWorkingHours.length });
      res.status(200).json({ success: true, data: savedWorkingHours });
    } catch (error) {
      logger.error("Error upserting working hours", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
