import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../supabase.js";
import logger from "../utils/logger.js";

export const login = async (req, res) => {
  try {
    const { login_identifier, password } = req.body || {};

    if (!login_identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "login_identifier та password є обов'язковими",
      });
    }

    const identifier = String(login_identifier).trim();

    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, email, role_id, is_active, is_super_admin, password_hash")
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .limit(1);

    if (error) {
      logger.error("Login query failed", { message: error.message });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const user = users?.[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Користувача з таким іменем або email не знайдено" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Акаунт деактивовано" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash || "");

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Невірний пароль" });
    }

    const { data: permissionRows, error: permissionsError } = await supabase
      .from("role_permissions")
      .select("permissions, modules!inner(name)")
      .eq("role_id", user.role_id);

    if (permissionsError) {
      logger.error("Permissions query failed", { message: permissionsError.message });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const userPermissions = (permissionRows || []).reduce((acc, row) => {
      const moduleName = row?.modules?.name;
      if (!moduleName) return acc;
      acc[moduleName] = row.permissions || {};
      return acc;
    }, {});

    const { data: roleRow, error: roleError } = await supabase
      .from("roles")
      .select("name")
      .eq("id", user.role_id)
      .maybeSingle();

    if (roleError) {
      logger.error("Role query failed", { message: roleError.message, role_id: user.role_id });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET is not configured");
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        is_super_admin: user.is_super_admin ?? false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role: roleRow?.name || null,
        is_active: user.is_active,
        is_super_admin: user.is_super_admin ?? false,
      },
      permissions: userPermissions,
    });
  } catch (error) {
    logger.error("Unexpected login error", { message: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
