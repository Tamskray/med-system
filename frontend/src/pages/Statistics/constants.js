import { CHART_TYPES } from "./Charts/constants";

export const RANGE_OPTIONS = [
  { value: 2, label: "2 дні" },
  { value: 7, label: "7 днів" },
  { value: 14, label: "2 тижні" },
  { value: 30, label: "Місяць" },
];

export const CHART_OPTIONS = {
  [CHART_TYPES.TREND]: "Динаміка",
  [CHART_TYPES.STATUS]: "Статуси",
  [CHART_TYPES.WORKLOAD]: "Навантаження",
};
