export const DAY_START = "08:00";
export const DAY_END = "20:00";
export const AXIS_STEP_MINUTES = 60;

export const BASE_SLOT_MINUTES = 15;
export const DAY_START_MINUTES = 480; // 08:00
export const DAY_END_MINUTES = 1200; // 20:00
export const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
export const TOTAL_GRID_COLUMNS = TOTAL_MINUTES / BASE_SLOT_MINUTES;

export const LEFT_COLUMN_WIDTH = 150;
export const TIMELINE_COLUMN_WIDTH = 38;
export const TIMELINE_GAP = 4;
export const TIMELINE_PADDING_X = 4;
export const TIMELINE_WIDTH = TOTAL_GRID_COLUMNS * TIMELINE_COLUMN_WIDTH;
export const TIMELINE_ROW_WIDTH =
  TIMELINE_WIDTH + (TOTAL_GRID_COLUMNS - 1) * TIMELINE_GAP + TIMELINE_PADDING_X * 2;
export const SCHEDULE_TABLE_MIN_WIDTH = LEFT_COLUMN_WIDTH + TIMELINE_ROW_WIDTH;

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "Заплановано", label: "Заплановано", editOnly: false },
  { value: "Прибув", label: "Прибув", editOnly: true },
  { value: "В процесі", label: "В процесі", editOnly: true },
  { value: "Завершено", label: "Завершено", editOnly: true },
  { value: "Скасовано", label: "Скасовано", editOnly: true },
];

export const BREAK = "break";

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: "Консультація", label: "Прийом пацієнта" },
  { value: BREAK, label: "Перерва" },
];

export const DEFAULT_BOOKING_FORM_VALUES = {
  patient_id: null,
  status: "Заплановано",
  appointment_type: "Консультація",
  cancellation_reason: "",
  notes: "",
};
