import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { PATIENTS_TABLE } from "../models/patients.js";

export class PatientsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static getPatientsSelect() {
    return "id, last_name, first_name, middle_name, date_of_birth, phone, email, created_at";
  }

  static async getAllPatients() {
    const { data: patients, error } = await supabase
      .from(PATIENTS_TABLE)
      .select(this.getPatientsSelect())
      .order("last_name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return patients;
  }

  static async getPatientById(id) {
    const { data: patient, error } = await supabase
      .from(PATIENTS_TABLE)
      .select(this.getPatientsSelect())
      .eq("id", id)
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return patient;
  }

  static async createPatient(data) {
    const { data: newPatient, error } = await supabase
      .from(PATIENTS_TABLE)
      .insert([data])
      .select(this.getPatientsSelect())
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newPatient;
  }

  static async updatePatient(id, data) {
    const { data: updatedPatient, error } = await supabase
      .from(PATIENTS_TABLE)
      .update(data)
      .eq("id", id)
      .select(this.getPatientsSelect())
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return updatedPatient;
  }

  static async deletePatient(id) {
    const { data: deletedPatient, error } = await supabase
      .from(PATIENTS_TABLE)
      .delete()
      .eq("id", id)
      .select(this.getPatientsSelect())
      .single();

    if (error) {
      if (this.isNotFoundError(error)) return null;
      throw new Error(error.message);
    }

    return deletedPatient;
  }
}
