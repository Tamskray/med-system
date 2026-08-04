import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

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

const fetchAppointments = async (params) => {
  const response = await apiFetch(`${API_BASE_URL}/appointments?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to load statistics");

  const result = await response.json();
  return result.data || [];
};

export const useStatistics = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [rangeDays, setRangeDays] = useState(7);
  const [chartType, setChartType] = useState(CHART_TYPES.TREND);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workloadAppointments, setWorkloadAppointments] = useState([]);
  const [isWorkloadLoading, setIsWorkloadLoading] = useState(false);

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
        const status = appointment.status || t("pages.statistics.noStatus");
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {}),
    [appointments, t],
  );
  const workloadByDoctor = useMemo(
    () =>
      workloadAppointments.reduce((counts, appointment) => {
        const doctorId = String(appointment.doctor_id);
        counts[doctorId] = (counts[doctorId] || 0) + 1;
        return counts;
      }, {}),
    [workloadAppointments],
  );
  const selectedDoctor = sortedDoctors.find(
    (doctor) => String(doctor.id) === String(selectedDoctorId),
  );
  const totalAppointments = dailyCounts.reduce((total, count) => total + count, 0);
  const totalWorkload = Object.values(workloadByDoctor).reduce((total, count) => total + count, 0);
  const isChartAvailable = Boolean(selectedDoctorId);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      if (!selectedDoctorId) {
        setAppointments([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          date_from: dateFrom,
          date_to: dateTo,
          doctor_id: selectedDoctorId,
        });
        const data = await fetchAppointments(params);
        if (isActive) setAppointments(data);
      } catch {
        if (isActive) setAppointments([]);
        showErrorToast(t("pages.statistics.loadError"));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadAppointments();
    return () => {
      isActive = false;
    };
  }, [dateFrom, dateTo, selectedDoctorId]);

  useEffect(() => {
    let isActive = true;

    const loadWorkload = async () => {
      setIsWorkloadLoading(true);
      try {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        const data = await fetchAppointments(params);
        if (isActive) setWorkloadAppointments(data);
      } catch {
        if (isActive) setWorkloadAppointments([]);
        showErrorToast(t("pages.statistics.loadError"));
      } finally {
        if (isActive) setIsWorkloadLoading(false);
      }
    };

    loadWorkload();
    return () => {
      isActive = false;
    };
  }, [dateFrom, dateTo]);

  return {
    chartDates,
    chartOptions: CHART_OPTIONS,
    chartType,
    dailyCounts,
    getDoctorFullName,
    isChartAvailable,
    isLoading,
    isWorkloadLoading,
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
