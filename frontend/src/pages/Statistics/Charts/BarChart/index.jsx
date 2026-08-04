import { BarElement, CategoryScale, Chart, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { PRIMARY_CHART_COLOR } from "../constants";
import { getBarChartOptions } from "./options";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function BarChart({ workloadByDoctor, sortedDoctors, getDoctorFullName }) {
  const { t } = useTranslation();
  const doctorIds = Object.keys(workloadByDoctor).sort((first, second) =>
    getDoctorFullName(sortedDoctors.find((doctor) => String(doctor.id) === first)).localeCompare(
      getDoctorFullName(sortedDoctors.find((doctor) => String(doctor.id) === second)),
    ),
  );

  const data = {
    labels: doctorIds.map(
      (doctorId) =>
        getDoctorFullName(sortedDoctors.find((doctor) => String(doctor.id) === doctorId)) ||
        t("pages.statistics.unknownDoctor"),
    ),
    datasets: [
      {
        label: t("pages.statistics.appointmentsSeries"),
        data: doctorIds.map((doctorId) => workloadByDoctor[doctorId]),
        backgroundColor: PRIMARY_CHART_COLOR,
        borderRadius: 4,
      },
    ],
  };

  return <Bar data={data} options={getBarChartOptions()} />;
}
