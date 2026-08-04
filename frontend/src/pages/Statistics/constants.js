import { CHART_TYPES } from "./Charts/constants";

export const RANGE_OPTIONS = [
  { value: 2, labelKey: "pages.statistics.period.twoDays" },
  { value: 7, labelKey: "pages.statistics.period.week" },
  { value: 14, labelKey: "pages.statistics.period.twoWeeks" },
  { value: 30, labelKey: "pages.statistics.period.month" },
];

export const CHART_OPTIONS = {
  [CHART_TYPES.TREND]: "pages.statistics.chartType.trend",
  [CHART_TYPES.STATUS]: "pages.statistics.chartType.status",
};
