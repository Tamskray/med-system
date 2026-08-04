import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { DEFAULT_STATUS_COLOR, STATUS_COLORS } from "../constants";
import { getDonutChartOptions } from "./options";

Chart.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ statusCounts }) {
  const labels = Object.keys(statusCounts);

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((status) => statusCounts[status]),
        backgroundColor: labels.map((status) => STATUS_COLORS[status] || DEFAULT_STATUS_COLOR),
        borderWidth: 0,
      },
    ],
  };

  return <Doughnut data={data} options={getDonutChartOptions()} />;
}
