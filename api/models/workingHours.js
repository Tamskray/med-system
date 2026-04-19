export const WorkingHoursSchema = {
  id: "bigint",
  doctor_id: "bigint",
  day_of_week: "integer",
  start_time: "time",
  end_time: "time",
};

export const WORKING_HOURS_TABLE = "working_hours";
