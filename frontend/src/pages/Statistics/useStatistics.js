import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchDoctors } from "../../redux/slices/doctors";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { getTodayIsoDate, shiftIsoDate } from "../../utils/dates";
import { showErrorToast } from "../../utils/toast";
import { CHART_TYPES } from "./Charts/constants";
import { CHART_OPTIONS, RANGE_OPTIONS } from "./constants";

const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ");

const getDateRange = (days) => {
  const dateTo = getTodayIsoDate();
  return { dateFrom: shiftIsoDate(dateTo, -(days - 1)), dateTo };
};

const getDates = (dateFrom, days) =>
  Array.from({ length: days }, (_, index) => shiftIsoDate(dateFrom, index));

export const useStatistics = () => {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [rangeDays, setRangeDays] = useState(7);
  const [chartType, setChartType] = useState(CHART_TYPES.TREND);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sortedDoctors = useMemo(
    () =>
      [...(doctors || [])].sort((first, second) =>
        getDoctorFullName(first).localeCompare(getDoctorFullName(second)),
      ),
    [doctors],
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
  const isChartAvailable = chartType === CHART_TYPES.WORKLOAD || Boolean(selectedDoctorId);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      const requiresDoctor = chartType !== CHART_TYPES.WORKLOAD;
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

  return {
    chartDates,
    chartOptions: CHART_OPTIONS,
    chartType,
    dailyCounts,
    getDoctorFullName,
    isChartAvailable,
    isLoading,
    rangeDays,
    rangeOptions: RANGE_OPTIONS,
    selectedDoctor,
    selectedDoctorId,
    setChartType,
    setRangeDays,
    setSelectedDoctorId,
    sortedDoctors,
    statusCounts,
    totalAppointments,
    totalWorkload,
    workloadByDoctor,
  };
};
