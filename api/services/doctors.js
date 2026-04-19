import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";

export class DoctorsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static getDoctorsSelect() {
    return "id, user_id, last_name, first_name, middle_name, department_id, room_id, slot_duration_override, is_active, departments(name), rooms(id, room_number)";
  }

  static async getAllDoctors() {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(this.getDoctorsSelect())
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return doctors;
  }

  static async getDoctorById(id) {
    const { data: doctor, error } = await supabase
      .from("doctors")
      .select(this.getDoctorsSelect())
      .eq("id", id)
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return doctor;
  }

  static async createDoctor(data) {
    const { data: newDoctor, error } = await supabase
      .from("doctors")
      .insert([data])
      .select(this.getDoctorsSelect())
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newDoctor;
  }

  static async updateDoctor(id, data) {
    const { data: updatedDoctor, error } = await supabase
      .from("doctors")
      .update(data)
      .eq("id", id)
      .select(this.getDoctorsSelect())
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return updatedDoctor;
  }

  static async deleteDoctor(id) {
    const { data: deletedDoctor, error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", id)
      .select(this.getDoctorsSelect())
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return deletedDoctor;
  }
}
