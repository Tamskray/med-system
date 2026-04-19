import { DepartmentsService } from "../services/departments.js";
import logger from "../utils/logger.js";

export class DepartmentsController {
  static async getAllDepartments(req, res) {
    try {
      const departments = await DepartmentsService.getAllDepartments();
      logger.info("Fetched all departments", { count: departments.length });
      res.status(200).json({ success: true, data: departments });
    } catch (error) {
      logger.error("Error fetching departments", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
