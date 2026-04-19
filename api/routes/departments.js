import { Router } from "express";
import { DepartmentsController } from "../controllers/departments.js";

const router = Router();

router.get("/", DepartmentsController.getAllDepartments);

export default router;
