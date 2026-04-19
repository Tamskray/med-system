import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { DEPARTMENTS_TABLE } from "../models/departments.js";

export class DepartmentsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static async getAllDepartments() {
    const { data: departments, error } = await supabase
      .from(DEPARTMENTS_TABLE)
      .select("id, name, description, default_slot_duration")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return departments;
  }
}
