import { Router } from "express";
import { DepartmentsController } from "../controllers/departments.js";
import { requirePermission } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get("/", requirePermission("doctors", "read"), DepartmentsController.getAllDepartments);

export default router;
