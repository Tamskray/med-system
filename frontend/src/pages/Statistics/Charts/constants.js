import { theme } from "../../../theme";

export const CHART_TYPES = {
  TREND: "trend",
  STATUS: "status",
};

export const STATUS_COLORS = {
  Заплановано: theme.palette.success.light,
  Прибув: theme.palette.warning.light,
  "В процесі": theme.palette.secondary.light,
  Завершено: theme.palette.info.light,
  Скасовано: theme.palette.error.light,
};

export const DEFAULT_STATUS_COLOR = theme.palette.grey[500];
export const PRIMARY_CHART_COLOR = "#00897b";
