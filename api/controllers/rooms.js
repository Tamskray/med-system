import { RoomsService } from "../services/rooms.js";
import logger from "../utils/logger.js";

export class RoomsController {
  static async getAllRooms(req, res) {
    try {
      const rooms = await RoomsService.getAllRooms();
      logger.info("Fetched all rooms", { count: rooms.length });
      res.status(200).json({ success: true, data: rooms });
    } catch (error) {
      logger.error("Error fetching rooms", { message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
