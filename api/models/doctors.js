export const DoctorSchema = {
  id: "bigint",
  user_id: "uuid",
  last_name: "text",
  first_name: "text",
  middle_name: "text",
  department_id: "bigint",
  room_id: "bigint",
  slot_duration_override: "integer",
  is_active: "boolean",
};

export const DOCTORS_TABLE = "doctors";
