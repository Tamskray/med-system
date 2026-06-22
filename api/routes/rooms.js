import { Router } from "express";
import { RoomsController } from "../controllers/rooms.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get("/", requirePermission("doctors", "read"), RoomsController.getAllRooms);

export default router;
