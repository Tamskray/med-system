export const AppointmentSchema = {
  id: "bigint",
  doctor_id: "bigint",
  patient_id: "bigint",
  appointment_date: "date",
  start_time: "timestamp with time zone",
  end_time: "timestamp with time zone",
  appointment_type: "text",
  status: "text",
  cancellation_reason: "text",
  notes: "text",
};

export const APPOINTMENTS_TABLE = "appointments";
