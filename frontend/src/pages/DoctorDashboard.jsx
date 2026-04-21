import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { fetchDoctors } from "../redux/slices/doctors";
import { showErrorToast } from "../utils/toast";

const API_BASE_URL = "http://localhost:5000/api";

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

const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ");

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

const getPatientFullName = (appointment) => {
  const patient = appointment?.patients || appointment?.patient || null;

  if (!patient) return "Без пацієнта";

  const fullName = [patient.last_name, patient.first_name, patient.middle_name]
    .filter(Boolean)
    .join(" ");

  return fullName || "Без пацієнта";
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [workingHoursForDay, setWorkingHoursForDay] = useState(null);
  const [isLoadingWorkingHours, setIsLoadingWorkingHours] = useState(false);

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

      setIsLoadingAppointments(true);
      try {
        const response = await fetch(
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

  useEffect(() => {
    let isActive = true;

    const loadWorkingHoursForDay = async () => {
      if (!selectedDoctorId) {
        setWorkingHoursForDay(null);
        return;
      }

      setIsLoadingWorkingHours(true);
      try {
        const response = await fetch(`${API_BASE_URL}/working-hours/${selectedDoctorId}`);
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

  const sortedDoctors = useMemo(
    () =>
      [...(doctors || [])].sort((a, b) => getDoctorFullName(a).localeCompare(getDoctorFullName(b))),
    [doctors],
  );

  const selectedDoctor = useMemo(
    () => sortedDoctors.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [sortedDoctors, selectedDoctorId],
  );

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
        if (appointment.status === "Cancelled") return false;

        const appointmentStart = timeToMinutes(formatTime(appointment.start_time));
        const appointmentEnd = timeToMinutes(formatTime(appointment.end_time));

        return Math.max(slotStart, appointmentStart) < Math.min(slotEnd, appointmentEnd);
      });
    });
  }, [selectedDoctorId, workingHoursForDay, selectedDoctor, appointments]);

  const handleOpenPatientRecord = (appointment) => {
    if (!appointment?.patient_id) return;
    navigate(`/patients/${appointment.patient_id}`);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Розклад лікаря
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            aria-label="Попередній день"
            onClick={() => setSelectedDate((prev) => shiftIsoDate(prev, -1))}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <TextField
            type="date"
            label="Дата"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          <IconButton
            aria-label="Наступний день"
            onClick={() => setSelectedDate((prev) => shiftIsoDate(prev, 1))}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        <FormControl size="small" sx={{ minWidth: 320, flex: "1 1 320px" }}>
          <Select
            displayEmpty
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            renderValue={(value) => {
              if (!value) return "Оберіть лікаря для перегляду...";
              const doctor = sortedDoctors.find((item) => String(item.id) === String(value));
              return doctor ? getDoctorFullName(doctor) : "Оберіть лікаря для перегляду...";
            }}
          >
            <MenuItem value="">Оберіть лікаря для перегляду...</MenuItem>
            {sortedDoctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {getDoctorFullName(doctor)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {!selectedDoctorId && (
        <Typography variant="body1" color="text.secondary">
          Будь ласка, оберіть лікаря
        </Typography>
      )}

      {selectedDoctorId && isLoadingAppointments && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {selectedDoctorId && (
        <Paper variant="outlined" elevation={0} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Вільні слоти
          </Typography>

          {isLoadingWorkingHours ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Завантаження робочих годин...
              </Typography>
            </Box>
          ) : !workingHoursForDay ? (
            <Typography variant="body2" color="text.secondary">
              Лікар не працює у цей день
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 1.25 }}>
                Доступно слотів: <strong>{freeSlots.length}</strong>
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {freeSlots.length ? (
                  freeSlots.map((slot) => (
                    <Chip
                      key={`${slot.start}-${slot.end}`}
                      label={`${slot.start} - ${slot.end}`}
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Вільних слотів немає
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>
      )}

      {selectedDoctorId && !isLoadingAppointments && appointments.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          На обрану дату записів немає
        </Typography>
      )}

      {selectedDoctorId && !isLoadingAppointments && appointments.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {appointments.map((appointment) => (
            <Paper
              key={appointment.id}
              variant="outlined"
              elevation={0}
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </Typography>

              <Typography variant="body2">
                <strong>Пацієнт:</strong> {getPatientFullName(appointment)}
              </Typography>

              <Typography variant="body2">
                <strong>Статус:</strong> {appointment.status || "Scheduled"}
              </Typography>

              <Typography variant="body2">
                <strong>Тип/Причина:</strong> {appointment.appointment_type || "-"}
              </Typography>

              <Box sx={{ pt: 0.5 }}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenPatientRecord(appointment)}
                  disabled={!appointment.patient_id}
                >
                  Відкрити картку
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default DoctorDashboard;
