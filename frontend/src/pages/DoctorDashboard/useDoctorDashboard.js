import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { ROLE_IDS } from "../../constants/roles";
import { fetchDoctors } from "../../redux/slices/doctors";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { showErrorToast } from "../../utils/toast";

export const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ");

export const getPatientFullName = (appointment) => {
  const patient = appointment?.patients || appointment?.patient || null;
  if (!patient) return "Без пацієнта";
  const fullName = [patient.last_name, patient.first_name, patient.middle_name]
    .filter(Boolean)
    .join(" ");
  return fullName || "Без пацієнта";
};

const getTodayIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftIsoDate = (isoDate, daysDelta) => {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysDelta);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

const formatTime = (dateTime) => String(dateTime || "").slice(11, 16);

const getDbDayOfWeekFromIsoDate = (isoDate) => {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return (localDate.getDay() + 6) % 7;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const normalizedMinutes = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
  const mins = String(normalizedMinutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

const generateTimeBlocks = (startTime, endTime, slotDurationMinutes) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const duration = Number(slotDurationMinutes) > 0 ? Number(slotDurationMinutes) : 30;
  const blocks = [];

  for (let current = start; current + duration <= end; current += duration) {
    blocks.push({
      start: minutesToTime(current),
      end: minutesToTime(current + duration),
    });
  }

  return blocks;
};

export const useDoctorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);
  const currentUser = useSelector((state) => state.auth.user);
  const isLoggedInDoctor = Number(currentUser?.role_id) === ROLE_IDS.DOCTOR;

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [workingHoursForDay, setWorkingHoursForDay] = useState(null);
  const [isLoadingWorkingHours, setIsLoadingWorkingHours] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Load appointments for selected doctor and date
  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      if (!selectedDoctorId) {
        setAppointments([]);
        return;
      }

      setIsLoadingAppointments(true);
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/appointments?doctor_id=${encodeURIComponent(selectedDoctorId)}&date=${encodeURIComponent(selectedDate)}`,
        );

        if (!response.ok) {
          throw new Error("Не вдалося завантажити записи");
        }

        const result = await response.json();
        if (isActive) {
          setAppointments(result.data || []);
        }
      } catch (error) {
        if (isActive) {
          setAppointments([]);
        }
        showErrorToast(error.message || "Не вдалося завантажити записи");
      } finally {
        if (isActive) {
          setIsLoadingAppointments(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isActive = false;
    };
  }, [selectedDoctorId, selectedDate]);

  // Load working hours for selected doctor
  useEffect(() => {
    let isActive = true;

    const loadWorkingHoursForDay = async () => {
      if (!selectedDoctorId) {
        setWorkingHoursForDay(null);
        return;
      }

      setIsLoadingWorkingHours(true);
      try {
        const response = await apiFetch(`${API_BASE_URL}/working-hours/${selectedDoctorId}`);
        if (!response.ok) {
          throw new Error("Не вдалося завантажити робочі години");
        }

        const result = await response.json();
        const dayOfWeek = getDbDayOfWeekFromIsoDate(selectedDate);
        const dayHours = (result.data || []).find(
          (workingHour) => Number(workingHour.day_of_week) === dayOfWeek,
        );

        if (!isActive) return;

        if (!dayHours) {
          setWorkingHoursForDay(null);
          return;
        }

        setWorkingHoursForDay({
          start: String(dayHours.start_time || "").slice(0, 5),
          end: String(dayHours.end_time || "").slice(0, 5),
        });
      } catch (error) {
        if (isActive) {
          setWorkingHoursForDay(null);
        }
        showErrorToast(error.message || "Не вдалося завантажити робочі години");
      } finally {
        if (isActive) {
          setIsLoadingWorkingHours(false);
        }
      }
    };

    loadWorkingHoursForDay();

    return () => {
      isActive = false;
    };
  }, [selectedDoctorId, selectedDate]);

  // Sort doctors by full name
  const sortedDoctors = useMemo(
    () =>
      [...(doctors || [])].sort((a, b) => getDoctorFullName(a).localeCompare(getDoctorFullName(b))),
    [doctors],
  );

  // Find current user's doctor
  const currentUserDoctor = useMemo(
    () =>
      sortedDoctors.find((doctor) => String(doctor.user_id) === String(currentUser?.id)) || null,
    [sortedDoctors, currentUser?.id],
  );

  // Set selected doctor to current user's doctor for logged-in doctors
  useEffect(() => {
    if (currentUserDoctor) {
      setSelectedDoctorId(String(currentUserDoctor.id));
    }
  }, [currentUserDoctor]);

  // Find selected doctor details
  const selectedDoctor = useMemo(
    () => sortedDoctors.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [sortedDoctors, selectedDoctorId],
  );

  // Calculate free slots
  const freeSlots = useMemo(() => {
    if (!selectedDoctorId || !workingHoursForDay?.start || !workingHoursForDay?.end) {
      return [];
    }

    const slotDuration =
      Number(selectedDoctor?.slot_duration_override) > 0
        ? Number(selectedDoctor.slot_duration_override)
        : 30;

    const allSlots = generateTimeBlocks(
      workingHoursForDay.start,
      workingHoursForDay.end,
      slotDuration,
    );

    return allSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);

      return !appointments.some((appointment) => {
        if (appointment.status === "Скасовано" || appointment.status === "Cancelled") return false;

        const appointmentStart = timeToMinutes(formatTime(appointment.start_time));
        const appointmentEnd = timeToMinutes(formatTime(appointment.end_time));

        return Math.max(slotStart, appointmentStart) < Math.min(slotEnd, appointmentEnd);
      });
    });
  }, [selectedDoctorId, workingHoursForDay, selectedDoctor, appointments]);

  // Handler to navigate to patient record
  const handleOpenPatientRecord = (appointment) => {
    if (!appointment?.patient_id) return;
    navigate(`/patients/${appointment.patient_id}`);
  };

  return {
    // State
    selectedDoctorId,
    selectedDate,
    appointments,
    isLoadingAppointments,
    workingHoursForDay,
    isLoadingWorkingHours,
    freeSlots,
    sortedDoctors,
    currentUserDoctor,
    selectedDoctor,
    isLoggedInDoctor,
    currentUser,

    // Setters
    setSelectedDoctorId,
    setSelectedDate,

    // Handlers
    handleOpenPatientRecord,
    shiftIsoDate,
    formatTime,

    // Exported for convenience
    getDoctorFullName,
    getPatientFullName,
  };
};
