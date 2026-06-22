import bcrypt from "bcryptjs";
import { supabase } from "../supabase.js";
import logger from "../utils/logger.js";

export class UsersController {
  static async getUsers(req, res) {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, username, email, role_id, is_active, is_super_admin, created_at")
        .order("id", { ascending: false });

      if (error) {
        logger.error("Error fetching users", { message: error.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      return res.status(200).json({ success: true, data: users || [] });
    } catch (error) {
      logger.error("Unexpected error while fetching users", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  static async getRoles(req, res) {
    try {
      const { data: roles, error } = await supabase
        .from("roles")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        logger.error("Error fetching roles", { message: error.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      return res.status(200).json({ success: true, data: roles || [] });
    } catch (error) {
      logger.error("Unexpected error while fetching roles", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  static async createUser(req, res) {
    try {
      const {
        username,
        email,
        password,
        role_id,
        is_active = true,
        is_super_admin = false,
      } = req.body || {};

      if (!username || !email || !password || role_id === undefined || role_id === null) {
        return res.status(400).json({
          success: false,
          message: "username, email, password та role_id є обов'язковими",
        });
      }

      const normalizedUsername = String(username).trim();
      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedRoleId = Number(role_id);

      if (!normalizedUsername || !normalizedEmail || Number.isNaN(normalizedRoleId)) {
        return res.status(400).json({
          success: false,
          message: "Некоректні значення username, email або role_id",
        });
      }

      const passwordHash = await bcrypt.hash(String(password), 10);

      const { data: createdUser, error } = await supabase
        .from("users")
        .insert({
          username: normalizedUsername,
          email: normalizedEmail,
          password_hash: passwordHash,
          role_id: normalizedRoleId,
          is_active: Boolean(is_active),
          is_super_admin: Boolean(is_super_admin),
        })
        .select("id, username, email, role_id, is_active, is_super_admin, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({
            success: false,
            message: "Користувач з таким username або email вже існує",
          });
        }

        logger.error("Error creating user", { message: error.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      logger.info("User created", { id: createdUser.id, username: createdUser.username });
      return res.status(201).json({ success: true, data: createdUser });
    } catch (error) {
      logger.error("Unexpected error while creating user", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  static async getModules(req, res) {
    try {
      const { data: modules, error } = await supabase
        .from("modules")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        logger.error("Error fetching modules", { message: error.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      return res.status(200).json({ success: true, data: modules || [] });
    } catch (error) {
      logger.error("Unexpected error while fetching modules", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  static async createRole(req, res) {
    try {
      const { name, permissions } = req.body || {};

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "name є обов'язковим" });
      }

      const normalizedName = name.trim();

      const { data: role, error: roleError } = await supabase
        .from("roles")
        .insert({ name: normalizedName })
        .select("id, name")
        .single();

      if (roleError) {
        if (roleError.code === "23505") {
          return res.status(409).json({ success: false, message: "Роль з такою назвою вже існує" });
        }
        logger.error("Error creating role", { message: roleError.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      if (permissions && typeof permissions === "object") {
        const permRows = Object.entries(permissions)
          .map(([moduleId, perms]) => ({
            role_id: role.id,
            module_id: Number(moduleId),
            permissions: {
              create: perms.create ? 1 : 0,
              read: perms.read ? 1 : 0,
              update: perms.update ? 1 : 0,
              delete: perms.delete ? 1 : 0,
            },
          }))
          .filter((row) => !Number.isNaN(row.module_id));

        if (permRows.length > 0) {
          const { error: permError } = await supabase.from("role_permissions").insert(permRows);

          if (permError) {
            logger.error("Error inserting role permissions", { message: permError.message });
            return res.status(500).json({ success: false, message: "Internal server error" });
          }
        }
      }

      logger.info("Role created", { id: role.id, name: role.name });
      return res.status(201).json({ success: true, data: role });
    } catch (error) {
      logger.error("Unexpected error while creating role", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}
