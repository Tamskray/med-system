import { Router } from "express";
import { UsersController } from "../controllers/users.js";
import { requirePermission, requireSuperAdmin } from "../middleware/permissionsMiddleware.js";

const router = Router();

router.get("/modules", requirePermission("users", "read"), UsersController.getModules);
router.get("/roles", requirePermission("users", "read"), UsersController.getRoles);
router.post("/roles", requireSuperAdmin, UsersController.createRole);
router.get("/", requirePermission("users", "read"), UsersController.getUsers);
router.post("/", requirePermission("users", "create"), UsersController.createUser);

export default router;
