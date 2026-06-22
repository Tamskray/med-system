import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { WORKING_HOURS_TABLE } from "../models/workingHours.js";

export class WorkingHoursService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static async getWorkingHours({ doctorIds, dayOfWeek } = {}) {
    let query = supabase.from(WORKING_HOURS_TABLE).select("*");

    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      query = query.in("doctor_id", doctorIds);
    }

    if (Number.isFinite(dayOfWeek)) {
      query = query.eq("day_of_week", dayOfWeek);
    }

    query = query.order("doctor_id", { ascending: true }).order("day_of_week", {
      ascending: true,
    });

    const { data: workingHours, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return workingHours || [];
  }

  static async getWorkingHoursByDoctorId(doctorId) {
    const { data: workingHours, error } = await supabase
      .from(WORKING_HOURS_TABLE)
      .select("*")
      .eq("doctor_id", doctorId)
      .order("day_of_week", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return workingHours || [];
  }

  static async upsertWorkingHours(doctorId, workingHoursData) {
    // Delete existing working hours for this doctor
    const { error: deleteError } = await supabase
      .from(WORKING_HOURS_TABLE)
      .delete()
      .eq("doctor_id", doctorId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Insert new working hours if data exists
    if (workingHoursData && workingHoursData.length > 0) {
      const dataToInsert = workingHoursData.map((wh) => ({
        doctor_id: doctorId,
        day_of_week: wh.day_of_week,
        start_time: wh.start_time,
        end_time: wh.end_time,
      }));

      const { data: newWorkingHours, error: insertError } = await supabase
        .from(WORKING_HOURS_TABLE)
        .insert(dataToInsert)
        .select("*");

      if (insertError) {
        throw new Error(insertError.message);
      }

      return newWorkingHours || [];
    }

    return [];
  }
}
