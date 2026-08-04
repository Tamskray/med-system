import { CHART_TYPES } from "./constants";
import DonutChart from "./DonutChart";
import LineChart from "./LineChart";

export default function Charts({ chartType, chartDates, dailyCounts, statusCounts }) {
  if (chartType === CHART_TYPES.STATUS) {
    return <DonutChart statusCounts={statusCounts} />;
  }

  return <LineChart chartDates={chartDates} dailyCounts={dailyCounts} />;
}
