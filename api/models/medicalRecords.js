export const MedicalRecordSchema = {
  id: "bigint",
  patient_id: "bigint",
  doctor_id: "bigint",
  appointment_id: "bigint",
  symptoms: "text",
  diagnosis: "text",
  prescription_notes: "text",
  attachments: "text[]",
  created_at: "timestamp with time zone",
};

export const MEDICAL_RECORDS_TABLE = "medical_records";
