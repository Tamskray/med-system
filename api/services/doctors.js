import { supabase } from "../supabase.js";
import { DOCTORS_TABLE } from "../models/doctors.js";

export class DoctorsService {
  static isNotFoundError(error) {
    return error?.code === "PGRST116";
  }

  static async getAllDoctors() {
    const { data: doctors, error } = await supabase
      .from(DOCTORS_TABLE)
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return doctors;
  }

  static async getDoctorById(id) {
    const { data: doctor, error } = await supabase
      .from(DOCTORS_TABLE)
      .select("*")
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
      .from(DOCTORS_TABLE)
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newDoctor;
  }

  static async updateDoctor(id, data) {
    const { data: updatedDoctor, error } = await supabase
      .from(DOCTORS_TABLE)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return updatedDoctor;
  }

  static async deleteDoctor(id) {
    const { data: deletedDoctor, error } = await supabase
      .from(DOCTORS_TABLE)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return deletedDoctor;
  }
}
