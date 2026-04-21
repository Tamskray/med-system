import { supabase } from "../supabase.js";
import { POSTGREST_ERROR_CODES } from "../constants/dbErrors.js";
import { APPOINTMENTS_TABLE } from "../models/appointments.js";
import { WORKING_HOURS_TABLE } from "../models/workingHours.js";
import { TIME_OFFS_TABLE } from "../models/timeOffs.js";

export class AppointmentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppointmentValidationError";
  }
}

export class AppointmentsService {
  static isNotFoundError(error) {
    return error?.code === POSTGREST_ERROR_CODES.NO_ROWS_RETURNED;
  }

  static getAppointmentsSelect() {
    return "id, doctor_id, patient_id, appointment_date, start_time, end_time, appointment_type, status, cancellation_reason, notes, patients(id, last_name, first_name, middle_name)";
  }

  static parseIsoDate(isoDate) {
    const [year, month, day] = String(isoDate).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  static getDbDayOfWeek(isoDate) {
    const jsDay = this.parseIsoDate(isoDate).getDay();
    return (jsDay + 6) % 7;
  }

  static getTimePart(value) {
    return String(value || "").slice(11, 19);
  }

  static async validateAgainstWorkingHoursAndTimeOff({
    doctorId,
    appointmentDate,
    startTime,
    endTime,
  }) {
    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      throw new AppointmentValidationError("Missing doctor or time fields for appointment");
    }

    const startTimePart = this.getTimePart(startTime);
    const endTimePart = this.getTimePart(endTime);

    if (!startTimePart || !endTimePart || startTimePart >= endTimePart) {
      throw new AppointmentValidationError("Invalid appointment time range");
    }

    const dayOfWeek = this.getDbDayOfWeek(appointmentDate);
    const { data: workingHours, error: workingHoursError } = await supabase
      .from(WORKING_HOURS_TABLE)
      .select("day_of_week, start_time, end_time")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .single();

    if (workingHoursError) {
      if (this.isNotFoundError(workingHoursError)) {
        throw new AppointmentValidationError("Doctor is not working on this day");
      }
      throw new Error(workingHoursError.message);
    }

    if (startTimePart < workingHours.start_time || endTimePart > workingHours.end_time) {
      throw new AppointmentValidationError("Appointment is outside doctor working hours");
    }

    const { data: overlappingTimeOffs, error: timeOffError } = await supabase
      .from(TIME_OFFS_TABLE)
      .select("id")
      .eq("doctor_id", doctorId)
      .lt("start_time", endTime)
      .gt("end_time", startTime)
      .limit(1);

    if (timeOffError) {
      throw new Error(timeOffError.message);
    }

    if ((overlappingTimeOffs || []).length > 0) {
      throw new AppointmentValidationError("Doctor has time off during this time");
    }
  }

  static async getAllAppointments({ date, doctorId, patientId } = {}) {
    let query = supabase
      .from(APPOINTMENTS_TABLE)
      .select(this.getAppointmentsSelect())
      .order("start_time", { ascending: true });

    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    if (date) {
      query = query.eq("appointment_date", date);
    }

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return appointments;
  }

  static async createAppointment(data) {
    await this.validateAgainstWorkingHoursAndTimeOff({
      doctorId: data.doctor_id,
      appointmentDate: data.appointment_date,
      startTime: data.start_time,
      endTime: data.end_time,
    });

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
    const { data: existingAppointment, error: existingAppointmentError } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select("id, doctor_id, appointment_date, start_time, end_time")
      .eq("id", id)
      .single();

    if (existingAppointmentError) {
      if (this.isNotFoundError(existingAppointmentError)) return null;
      throw new Error(existingAppointmentError.message);
    }

    await this.validateAgainstWorkingHoursAndTimeOff({
      doctorId: data.doctor_id ?? existingAppointment.doctor_id,
      appointmentDate: data.appointment_date ?? existingAppointment.appointment_date,
      startTime: data.start_time ?? existingAppointment.start_time,
      endTime: data.end_time ?? existingAppointment.end_time,
    });

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
