import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { APPOINTMENTS_TABLE } from "../models/appointments.js";
import { TIME_OFFS_TABLE } from "../models/timeOffs.js";

export class DoctorTimeOffValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DoctorTimeOffValidationError";
  }
}

export class DoctorTimeOffConflictError extends Error {
  constructor(message, { count = 0, appointments = [] } = {}) {
    super(message);
    this.name = "DoctorTimeOffConflictError";
    this.count = count;
    this.appointments = appointments;
  }
}

export class DoctorsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static getDoctorsSelect() {
    return "id, user_id, last_name, first_name, middle_name, department_id, room_id, slot_duration_override, is_active, departments(name), rooms(id, room_number)";
  }

  static normalizeIsoDate(value) {
    return String(value || "").slice(0, 10);
  }

  static isValidIsoDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  static shiftIsoDate(isoDate, daysDelta) {
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + daysDelta);
    return date.toISOString().slice(0, 10);
  }

  static validateTimeOffRange(startDate, endDate) {
    const normalizedStartDate = this.normalizeIsoDate(startDate);
    const normalizedEndDate = this.normalizeIsoDate(endDate);

    if (!this.isValidIsoDate(normalizedStartDate) || !this.isValidIsoDate(normalizedEndDate)) {
      throw new DoctorTimeOffValidationError("start_date and end_date are required");
    }

    if (normalizedEndDate < normalizedStartDate) {
      throw new DoctorTimeOffValidationError("end_date cannot be before start_date");
    }

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      startTime: `${normalizedStartDate}T00:00:00.000Z`,
      endTime: `${this.shiftIsoDate(normalizedEndDate, 1)}T00:00:00.000Z`,
    };
  }

  static parseDoctorIds(value) {
    return String(value || "")
      .split(",")
      .map((doctorId) => Number(doctorId.trim()))
      .filter(Boolean);
  }

  static async getTimeOffs({ date, doctorIds } = {}) {
    const normalizedDate = this.normalizeIsoDate(date);

    if (!this.isValidIsoDate(normalizedDate)) {
      throw new DoctorTimeOffValidationError("date is required");
    }

    const range = this.validateTimeOffRange(normalizedDate, normalizedDate);
    const normalizedDoctorIds = Array.isArray(doctorIds)
      ? doctorIds.map(Number).filter(Boolean)
      : this.parseDoctorIds(doctorIds);

    let query = supabase
      .from(TIME_OFFS_TABLE)
      .select("id, doctor_id, start_time, end_time, reason")
      .lt("start_time", range.endTime)
      .gt("end_time", range.startTime)
      .order("start_time", { ascending: true });

    if (normalizedDoctorIds.length > 0) {
      query = query.in("doctor_id", normalizedDoctorIds);
    }

    const { data: timeOffs, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return timeOffs || [];
  }

  static async getDoctorTimeOffConflicts(doctorId, startDate, endDate) {
    const normalizedDoctorId = Number(doctorId);

    if (!normalizedDoctorId) {
      throw new DoctorTimeOffValidationError("doctor_id is required");
    }

    const range = this.validateTimeOffRange(startDate, endDate);

    const { data: appointments, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select(
        "id, appointment_date, start_time, end_time, status, patients(id, last_name, first_name, middle_name)",
      )
      .eq("doctor_id", normalizedDoctorId)
      .gte("appointment_date", range.startDate)
      .lte("appointment_date", range.endDate)
      .neq("status", "Скасовано")
      .neq("status", "Завершено")
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return {
      count: (appointments || []).length,
      appointments: appointments || [],
      ...range,
    };
  }

  static async createDoctorTimeOff({ doctorId, startDate, endDate, reason }) {
    const normalizedDoctorId = Number(doctorId);

    if (!normalizedDoctorId) {
      throw new DoctorTimeOffValidationError("doctor_id is required");
    }

    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) {
      throw new DoctorTimeOffValidationError("reason is required");
    }

    const conflicts = await this.getDoctorTimeOffConflicts(normalizedDoctorId, startDate, endDate);

    if (conflicts.count > 0) {
      throw new DoctorTimeOffConflictError(
        "Неможливо зберегти. На ці дати у лікаря є заплановані візити.",
        conflicts,
      );
    }

    const { data: createdTimeOff, error } = await supabase
      .from(TIME_OFFS_TABLE)
      .insert([
        {
          doctor_id: normalizedDoctorId,
          start_time: conflicts.startTime,
          end_time: conflicts.endTime,
          reason: trimmedReason,
        },
      ])
      .select("id, doctor_id, start_time, end_time, reason")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return createdTimeOff;
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
