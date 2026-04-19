export const TimeOffSchema = {
  id: "bigint",
  doctor_id: "bigint",
  start_time: "timestamp with time zone",
  end_time: "timestamp with time zone",
  reason: "text",
};

export const TIME_OFFS_TABLE = "time_offs";
