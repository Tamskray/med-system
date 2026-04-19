import { Router } from "express";
import { RoomsController } from "../controllers/rooms.js";

const router = Router();

router.get("/", RoomsController.getAllRooms);

export default router;
