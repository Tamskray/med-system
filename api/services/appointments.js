import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { APPOINTMENTS_TABLE } from "../models/appointments.js";

export class AppointmentsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static getAppointmentsSelect() {
    return "id, doctor_id, patient_id, appointment_date, start_time, end_time, appointment_type, status, cancellation_reason, notes, patients(id, last_name, first_name, middle_name)";
  }

  static async getAllAppointments({ date } = {}) {
    let query = supabase
      .from(APPOINTMENTS_TABLE)
      .select(this.getAppointmentsSelect())
      .order("start_time", { ascending: true });

    if (date) {
      query = query.eq("appointment_date", date);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return appointments;
  }

  static async createAppointment(data) {
    const { data: newAppointment, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([data])
      .select(this.getAppointmentsSelect())
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newAppointment;
  }

  static async updateAppointment(id, data) {
    const { data: updatedAppointment, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update(data)
      .eq("id", id)
      .select(this.getAppointmentsSelect())
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return updatedAppointment;
  }
}
