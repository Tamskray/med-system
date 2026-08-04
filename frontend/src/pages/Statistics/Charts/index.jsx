import BarChart from "./BarChart";
import { CHART_TYPES } from "./constants";
import DonutChart from "./DonutChart";
import LineChart from "./LineChart";

export default function Charts({
  chartType,
  chartDates,
  dailyCounts,
  statusCounts,
  workloadByDoctor,
  sortedDoctors,
  getDoctorFullName,
}) {
  if (chartType === CHART_TYPES.STATUS) {
    return <DonutChart statusCounts={statusCounts} />;
  }

  if (chartType === CHART_TYPES.WORKLOAD) {
    return (
      <BarChart
        workloadByDoctor={workloadByDoctor}
        sortedDoctors={sortedDoctors}
        getDoctorFullName={getDoctorFullName}
      />
    );
  }

  return <LineChart chartDates={chartDates} dailyCounts={dailyCounts} />;
}
