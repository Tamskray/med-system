import { supabase } from "../supabase.js";
import logger from "../utils/logger.js";

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.is_super_admin !== true) {
    return res.status(403).json({
      success: false,
      message: "Доступ заборонено: потрібні права суперадміна",
    });
  }
  return next();
};

export const requirePermission = (moduleName, requiredAction) => {
  return async (req, res, next) => {
    try {
      if (req.user?.is_super_admin === true) {
        return next();
      }

      const roleId = req.user?.role_id;

      if (!roleId) {
        return res.status(403).json({
          success: false,
          message: "Доступ заборонено: недостатньо прав",
        });
      }

      const { data, error } = await supabase
        .from("role_permissions")
        .select("permissions, modules!inner(name)")
        .eq("role_id", roleId)
        .eq("modules.name", moduleName)
        .limit(1);

      if (error) {
        logger.error("Permissions query failed", {
          roleId,
          moduleName,
          requiredAction,
          message: error.message,
        });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      const record = data?.[0];
      const permissions = record?.permissions || {};
      const allowed = permissions?.[requiredAction] === 1 || permissions?.[requiredAction] === true;

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Доступ заборонено: недостатньо прав",
        });
      }

      return next();
    } catch (error) {
      logger.error("Permissions middleware failed", {
        moduleName,
        requiredAction,
        message: error.message,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
};
