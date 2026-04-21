import { supabase } from "../supabase.js";
import { MEDICAL_RECORDS_TABLE } from "../models/medicalRecords.js";

export class MedicalRecordsService {
  static getMedicalRecordsSelect() {
    return "id, patient_id, doctor_id, appointment_id, symptoms, diagnosis, prescription_notes, attachments, created_at";
  }

  static async getMedicalRecords({ patientId } = {}) {
    let query = supabase
      .from(MEDICAL_RECORDS_TABLE)
      .select(this.getMedicalRecordsSelect())
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async createMedicalRecord(record) {
    const { data, error } = await supabase
      .from(MEDICAL_RECORDS_TABLE)
      .insert([record])
      .select(this.getMedicalRecordsSelect())
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
