import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { PRIMARY_CHART_COLOR } from "../constants";
import { getLineChartOptions } from "./options";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const formatDateLabel = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(
    new Date(year, month - 1, day),
  );
};

export default function LineChart({ chartDates, dailyCounts }) {
  const data = {
    labels: chartDates.map(formatDateLabel),
    datasets: [
      {
        label: "Записів",
        data: dailyCounts,
        borderColor: PRIMARY_CHART_COLOR,
        backgroundColor: "rgba(0, 137, 123, 0.12)",
        fill: true,
        tension: 0.28,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  return <Line data={data} options={getLineChartOptions()} />;
}
