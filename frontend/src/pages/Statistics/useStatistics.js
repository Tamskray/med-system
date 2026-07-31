import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Chart from "chart.js/auto";

import { ROLE_IDS } from "../../constants/roles";
import { fetchDoctors } from "../../redux/slices/doctors";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { getTodayIsoDate, shiftIsoDate } from "../../utils/dates";
import { showErrorToast } from "../../utils/toast";

const RANGE_OPTIONS = [
  { value: 2, label: "2 дні" },
  { value: 7, label: "7 днів" },
  { value: 14, label: "2 тижні" },
  { value: 30, label: "Місяць" },
];

const CHART_OPTIONS = {
  trend: "Динаміка",
  status: "Статуси",
  workload: "Навантаження",
};

const STATUS_COLORS = {
  Заплановано: "#1976d2",
  Завершено: "#00897b",
  Скасовано: "#d32f2f",
};

const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ");

const getDateRange = (days) => {
  const dateTo = getTodayIsoDate();
  return { dateFrom: shiftIsoDate(dateTo, -(days - 1)), dateTo };
};

const getDates = (dateFrom, days) =>
  Array.from({ length: days }, (_, index) => shiftIsoDate(dateFrom, index));

const formatDateLabel = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(
    new Date(year, month - 1, day),
  );
};

export const useStatistics = () => {
  const dispatch = useDispatch();
  const chartCanvasRef = useRef(null);
  const chartRef = useRef(null);
  const { doctors } = useSelector((state) => state.doctors);
  const currentUser = useSelector((state) => state.auth.user);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [rangeDays, setRangeDays] = useState(7);
  const [chartType, setChartType] = useState("trend");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sortedDoctors = useMemo(
    () =>
      [...(doctors || [])].sort((first, second) =>
        getDoctorFullName(first).localeCompare(getDoctorFullName(second)),
      ),
    [doctors],
  );
  const isLoggedInDoctor = Number(currentUser?.role_id) === ROLE_IDS.DOCTOR;
  const currentUserDoctor = useMemo(
    () => sortedDoctors.find((doctor) => String(doctor.user_id) === String(currentUser?.id)),
    [currentUser?.id, sortedDoctors],
  );
  const { dateFrom, dateTo } = useMemo(() => getDateRange(rangeDays), [rangeDays]);
  const chartDates = useMemo(() => getDates(dateFrom, rangeDays), [dateFrom, rangeDays]);
  const appointmentsByDate = useMemo(
    () =>
      appointments.reduce((counts, appointment) => {
        const date = appointment.appointment_date;
        counts[date] = (counts[date] || 0) + 1;
        return counts;
      }, {}),
    [appointments],
  );
  const dailyCounts = useMemo(
    () => chartDates.map((date) => appointmentsByDate[date] || 0),
    [appointmentsByDate, chartDates],
  );
  const statusCounts = useMemo(
    () =>
      appointments.reduce((counts, appointment) => {
        const status = appointment.status || "Без статусу";
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {}),
    [appointments],
  );
  const workloadByDoctor = useMemo(
    () =>
      appointments.reduce((counts, appointment) => {
        const doctorId = String(appointment.doctor_id);
        counts[doctorId] = (counts[doctorId] || 0) + 1;
        return counts;
      }, {}),
    [appointments],
  );
  const selectedDoctor = sortedDoctors.find(
    (doctor) => String(doctor.id) === String(selectedDoctorId),
  );
  const totalAppointments = dailyCounts.reduce((total, count) => total + count, 0);
  const totalWorkload = Object.values(workloadByDoctor).reduce((total, count) => total + count, 0);
  const isChartAvailable = chartType === "workload" || Boolean(selectedDoctorId);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedInDoctor && currentUserDoctor) {
      setSelectedDoctorId(String(currentUserDoctor.id));
    }
  }, [currentUserDoctor, isLoggedInDoctor]);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      const requiresDoctor = chartType !== "workload";
      if (requiresDoctor && !selectedDoctorId) {
        setAppointments([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        if (requiresDoctor) params.set("doctor_id", selectedDoctorId);

        const response = await apiFetch(`${API_BASE_URL}/appointments?${params.toString()}`);
        if (!response.ok) throw new Error("Не вдалося завантажити статистику");

        const result = await response.json();
        if (isActive) setAppointments(result.data || []);
      } catch (error) {
        if (isActive) setAppointments([]);
        showErrorToast(error.message || "Не вдалося завантажити статистику");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadAppointments();
    return () => {
      isActive = false;
    };
  }, [chartType, dateFrom, dateTo, selectedDoctorId]);

  const chartConfig = useMemo(() => {
    if (chartType === "status") {
      const labels = Object.keys(statusCounts);
      return {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: labels.map((status) => statusCounts[status]),
              backgroundColor: labels.map((status) => STATUS_COLORS[status] || "#757575"),
              borderWidth: 0,
            },
          ],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      };
    }

    if (chartType === "workload") {
      const doctorIds = Object.keys(workloadByDoctor).sort((first, second) =>
        getDoctorFullName(
          sortedDoctors.find((doctor) => String(doctor.id) === first),
        ).localeCompare(
          getDoctorFullName(sortedDoctors.find((doctor) => String(doctor.id) === second)),
        ),
      );
      return {
        type: "bar",
        data: {
          labels: doctorIds.map(
            (doctorId) =>
              getDoctorFullName(sortedDoctors.find((doctor) => String(doctor.id) === doctorId)) ||
              "Невідомий лікар",
          ),
          datasets: [
            {
              label: "Записів",
              data: doctorIds.map((doctorId) => workloadByDoctor[doctorId]),
              backgroundColor: "#00897b",
              borderRadius: 4,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      };
    }

    return {
      type: "line",
      data: {
        labels: chartDates.map(formatDateLabel),
        datasets: [
          {
            label: "Записів",
            data: dailyCounts,
            borderColor: "#00897b",
            backgroundColor: "rgba(0, 137, 123, 0.12)",
            fill: true,
            tension: 0.28,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { grid: { display: false } },
        },
      },
    };
  }, [chartDates, chartType, dailyCounts, sortedDoctors, statusCounts, workloadByDoctor]);

  useEffect(() => {
    if (!chartCanvasRef.current || !isChartAvailable) return undefined;

    chartRef.current?.destroy();
    chartRef.current = new Chart(chartCanvasRef.current, {
      ...chartConfig,
      options: { ...chartConfig.options, responsive: true, maintainAspectRatio: false },
    });

    return () => chartRef.current?.destroy();
  }, [chartConfig, isChartAvailable]);

  return {
    chartCanvasRef,
    chartOptions: CHART_OPTIONS,
    chartType,
    currentUserDoctor,
    getDoctorFullName,
    isChartAvailable,
    isLoading,
    isLoggedInDoctor,
    rangeDays,
    rangeOptions: RANGE_OPTIONS,
    selectedDoctor,
    selectedDoctorId,
    setChartType,
    setRangeDays,
    setSelectedDoctorId,
    sortedDoctors,
    totalAppointments,
    totalWorkload,
  };
};
