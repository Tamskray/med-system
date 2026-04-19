export const PatientSchema = {
  id: "bigint",
  last_name: "text",
  first_name: "text",
  middle_name: "text",
  date_of_birth: "date",
  phone: "text",
  email: "text",
  created_at: "timestamp with time zone",
};

export const PATIENTS_TABLE = "patients";
