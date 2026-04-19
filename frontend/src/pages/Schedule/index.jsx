import { useMemo, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../../redux/slices/doctors";
import { fetchPatients, createPatient } from "../../redux/slices/patients";
import Modal from "../../components/core/Modal";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import PatientsForm from "../Patients/PatientsForm";
import { PATIENT_FORM_MODES } from "../Patients/constants";

const DAY_START = "08:00";
const DAY_END = "18:00";
const AXIS_END = "18:00";
const AXIS_STEP_MINUTES = 60;
const API_BASE_URL = "http://localhost:5000/api";
const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const BASE_SLOT_MINUTES = 15;
const TOTAL_MINUTES = timeToMinutes(DAY_END) - timeToMinutes(DAY_START);
const TOTAL_GRID_COLUMNS = TOTAL_MINUTES / BASE_SLOT_MINUTES;
const LEFT_COLUMN_WIDTH = 260;
const TIMELINE_COLUMN_WIDTH = 38;
const TIMELINE_WIDTH = TOTAL_GRID_COLUMNS * TIMELINE_COLUMN_WIDTH;
const SCHEDULE_TABLE_MIN_WIDTH = LEFT_COLUMN_WIDTH + TIMELINE_WIDTH;

const minutesToTime = (minutes) => {
  const normalizedMinutes = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (normalizedMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const getTimeAxis = (startTime, endTime, stepMinutes = AXIS_STEP_MINUTES) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const axis = [];

  for (let current = start; current <= end; current += stepMinutes) {
    axis.push(minutesToTime(current));
  }

  return axis;
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

function Schedule() {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);
  const { patients, isLoading: isPatientsLoading } = useSelector((state) => state.patients);
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [appointments, setAppointments] = useState([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingFormValues, setBookingFormValues] = useState({
    patient_id: null,
    status: "Scheduled",
    appointment_type: "Consultation",
    cancellation_reason: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsAppointmentsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments?date=${encodeURIComponent(selectedDate)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const result = await response.json();
        setAppointments(result.data || []);
      } catch (error) {
        showErrorToast(error.message || "Failed to fetch appointments");
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    loadAppointments();
  }, [selectedDate]);

  const doctorsByDepartment = useMemo(() => {
    if (!doctors?.length) return {};

    return doctors.reduce((groups, doctor) => {
      const departmentName = doctor.departments?.name || doctor.department_name || "Без відділення";

      if (!groups[departmentName]) {
        groups[departmentName] = [];
      }

      groups[departmentName].push(doctor);
      return groups;
    }, {});
  }, [doctors]);

  const axisHours = useMemo(() => getTimeAxis(DAY_START, AXIS_END), []);

  const openBookingModal = (doctor, block) => {
    setSelectedSlot({
      doctorId: doctor.id,
      doctorName: [doctor.last_name, doctor.first_name].filter(Boolean).join(" "),
      departmentName: doctor.departments?.name || doctor.department_name || "Без відділення",
      roomNumber: doctor.rooms?.room_number || doctor.room_number || "—",
      start: block.start,
      end: block.end,
    });
    setBookingFormValues({
      patient_id: null,
      status: "Scheduled",
      appointment_type: "Consultation",
      cancellation_reason: "",
      notes: "",
    });
    setSelectedAppointment(null);
    setIsBookingModalOpen(true);
  };

  const openEditAppointmentModal = (doctor, block, appointment) => {
    setSelectedSlot({
      doctorId: doctor.id,
      doctorName: [doctor.last_name, doctor.first_name].filter(Boolean).join(" "),
      departmentName: doctor.departments?.name || doctor.department_name || "Без відділення",
      roomNumber: doctor.rooms?.room_number || doctor.room_number || "—",
      start: block.start,
      end: block.end,
    });
    setSelectedAppointment(appointment);
    setBookingFormValues({
      patient_id: appointment.patient_id ?? null,
      status: appointment.status || "Scheduled",
      appointment_type: appointment.appointment_type || "Consultation",
      cancellation_reason: appointment.cancellation_reason || "",
      notes: appointment.notes || "",
    });
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedSlot(null);
    setSelectedAppointment(null);
  };

  const handleBookingFieldChange = (field) => (event) => {
    setBookingFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePatientSelectionChange = (_, patient) => {
    setBookingFormValues((prev) => ({ ...prev, patient_id: patient?.id ?? null }));
  };

  const handleOpenCreatePatientModal = () => {
    setIsCreatePatientModalOpen(true);
  };

  const handleCloseCreatePatientModal = () => {
    setIsCreatePatientModalOpen(false);
  };

  const handleCreatePatientSubmit = async (patientData) => {
    try {
      const createdPatient = await dispatch(createPatient(patientData)).unwrap();
      setBookingFormValues((prev) => ({ ...prev, patient_id: createdPatient.id }));
      setIsCreatePatientModalOpen(false);
    } catch (error) {
      showErrorToast(error || "Failed to create patient");
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedSlot) return;

    const upsertAppointment = async () => {
      setIsBookingSubmitting(true);
      try {
        const payload = {
          patient_id: bookingFormValues.patient_id,
          appointment_date: selectedAppointment?.appointment_date || selectedDate,
          start_time: `${selectedAppointment?.appointment_date || selectedDate}T${selectedSlot.start}:00.000Z`,
          end_time: `${selectedAppointment?.appointment_date || selectedDate}T${selectedSlot.end}:00.000Z`,
          appointment_type: bookingFormValues.appointment_type || "Consultation",
          status: bookingFormValues.status || "Scheduled",
          cancellation_reason: bookingFormValues.cancellation_reason || null,
          notes: bookingFormValues.notes,
        };

        const isEditMode = Boolean(selectedAppointment?.id);
        const requestPayload = isEditMode
          ? payload
          : { ...payload, doctor_id: selectedSlot.doctorId };

        const response = await fetch(
          isEditMode
            ? `${API_BASE_URL}/appointments/${selectedAppointment.id}`
            : `${API_BASE_URL}/appointments`,
          {
            method: isEditMode ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload),
          },
        );

        if (!response.ok) {
          throw new Error(
            isEditMode ? "Failed to update appointment" : "Failed to create appointment",
          );
        }

        const result = await response.json();
        const savedAppointment = result.data;

        setAppointments((prev) => {
          if (isEditMode) {
            return prev.map((appointment) =>
              appointment.id === savedAppointment.id ? savedAppointment : appointment,
            );
          }
          return [...prev, savedAppointment];
        });

        showSuccessToast(isEditMode ? "Запис оновлено" : "Запис успішно створено");
        handleCloseBookingModal();
      } catch (error) {
        showErrorToast(error.message || "Failed to save appointment");
      } finally {
        setIsBookingSubmitting(false);
      }
    };

    upsertAppointment();
  };

  const getAppointmentForSlot = (doctorId, block) => {
    return (
      appointments.find((appointment) => {
        if (Number(appointment.doctor_id) !== Number(doctorId)) return false;
        if (appointment.status === "Cancelled") return false;

        const startTime = String(appointment.start_time || "").slice(11, 16);
        const endTime = String(appointment.end_time || "").slice(11, 16);

        return startTime === block.start && endTime === block.end;
      }) || null
    );
  };

  const getPatientFullName = (appointment) => {
    if (!appointment?.patients) return "Без пацієнта";

    const fullName = [
      appointment.patients.last_name,
      appointment.patients.first_name,
      appointment.patients.middle_name,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "Без пацієнта";
  };

  const getSlotPalette = (appointment, slotIndex) => {
    if (!appointment) {
      return {
        bg: slotIndex % 2 === 0 ? "grey.50" : "grey.100",
        hoverBg: "primary.50",
        text: "text.secondary",
      };
    }

    const status = appointment.status || "Scheduled";
    if (status === "Completed") {
      return { bg: "info.light", hoverBg: "info.main", text: "info.dark" };
    }
    if (status === "Cancelled") {
      return { bg: "error.light", hoverBg: "error.main", text: "error.dark" };
    }
    return { bg: "success.light", hoverBg: "success.main", text: "success.dark" };
  };

  return (
    <Box sx={{ minWidth: 0, width: "100%", overflowX: "hidden" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Розклад
      </Typography>

      <Box sx={{ mb: 2, maxWidth: 260 }}>
        <TextField
          label="Дата"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          maxHeight: "calc(100vh - 220px)",
          borderRadius: 2,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <Box sx={{ minWidth: SCHEDULE_TABLE_MIN_WIDTH }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `${LEFT_COLUMN_WIDTH}px ${TIMELINE_WIDTH}px`,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Box sx={{ p: 1.5, borderRight: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Лікар / Кабінет
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, ${TIMELINE_COLUMN_WIDTH}px)`,
              }}
            >
              {axisHours.map((hour) => {
                // An hour is 60 mins. 60 / 15 = 4 columns.
                const columnSpan = 60 / BASE_SLOT_MINUTES;

                return (
                  <Box
                    key={hour}
                    sx={{
                      gridColumn: `span ${columnSpan}`, // Forces it to take up exact proportional space
                      p: 1,
                      textAlign: "center",
                      borderRight: "1px solid",
                      borderColor: "divider",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {hour}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {Object.entries(doctorsByDepartment).map(([departmentName, departmentDoctors]) => (
            <Box key={departmentName}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2">{departmentName}</Typography>
              </Box>

              {departmentDoctors.map((doctor) => {
                const slotDuration =
                  doctor.active_slot_duration ?? doctor.slot_duration_override ?? 30;
                const timeBlocks = generateTimeBlocks(DAY_START, DAY_END, slotDuration);

                return (
                  <Box
                    key={doctor.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `${LEFT_COLUMN_WIDTH}px ${TIMELINE_WIDTH}px`,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRight: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 0.25,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {doctor.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Кабінет: {doctor.rooms?.room_number || doctor.room_number || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Слот: {slotDuration} хв
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, ${TIMELINE_COLUMN_WIDTH}px)`,
                        gap: 0.5,
                        p: 0.5,
                        bgcolor: "grey.100",
                      }}
                    >
                      {timeBlocks.map((block, slotIndex) => {
                        const appointment = getAppointmentForSlot(doctor.id, block);
                        const occupied = Boolean(appointment);
                        const palette = getSlotPalette(appointment, slotIndex);
                        const slotStatus = occupied ? appointment.status || "Scheduled" : "Free";

                        // Calculate exact visual width based on time
                        const span = slotDuration / BASE_SLOT_MINUTES; // 30min = span 2, 45min = span 3, 60min = span 4

                        return (
                          <Box
                            key={`${doctor.id}-${block.start}`}
                            onClick={() => {
                              if (occupied) {
                                openEditAppointmentModal(doctor, block, appointment);
                              } else {
                                openBookingModal(doctor, block);
                              }
                            }}
                            sx={{
                              gridColumn: `span ${span}`, // Forces proportional width!
                              minHeight: 74,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.25,
                              px: 0.4,
                              textAlign: "center",
                              fontFamily: "Roboto, Arial, sans-serif",
                              color: palette.text,
                              backgroundColor: palette.bg,
                              overflow: "hidden", // Prevents text from pushing the cell wider
                              transition: "background-color 120ms ease",
                              "&:hover": occupied
                                ? { backgroundColor: palette.hoverBg, color: "common.white" }
                                : { backgroundColor: palette.hoverBg },
                            }}
                            title={
                              occupied
                                ? `${block.start} - ${block.end} (${getPatientFullName(appointment)})`
                                : `${block.start} - ${block.end}`
                            }
                          >
                            {!occupied && (
                              <Typography sx={{ fontSize: 14, lineHeight: 1, fontWeight: 700 }}>
                                +
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                fontSize: 10,
                                lineHeight: 1.1,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {block.start}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 10, lineHeight: 1.1, whiteSpace: "nowrap" }}
                            >
                              {slotStatus}
                            </Typography>
                            {occupied && (
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  lineHeight: 1.1,
                                  maxWidth: "100%",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                }}
                              >
                                {getPatientFullName(appointment)}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}

          {!isLoading &&
            !isAppointmentsLoading &&
            Object.keys(doctorsByDepartment).length === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Немає даних для відображення.</Typography>
              </Box>
            )}
        </Box>
      </Paper>

      <Modal
        open={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        title={selectedAppointment ? "Редагувати запис" : "Створити запис"}
        onSubmit={handleBookingSubmit}
        submitText={selectedAppointment ? "Оновити" : "Підтвердити"}
        cancelText="Скасувати"
        submitDisabled={isBookingSubmitting}
      >
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "grey.100" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedSlot?.doctorName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {selectedSlot?.departmentName} | Кабінет: {selectedSlot?.roomNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {selectedAppointment?.appointment_date || selectedDate} | {selectedSlot?.start} -{" "}
              {selectedSlot?.end}
            </Typography>
          </Box>

          <Autocomplete
            options={patients || []}
            loading={isPatientsLoading}
            value={
              (patients || []).find((patient) => patient.id === bookingFormValues.patient_id) ||
              null
            }
            onChange={handlePatientSelectionChange}
            getOptionLabel={(option) =>
              [option.last_name, option.first_name, option.middle_name].filter(Boolean).join(" ")
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {[option.last_name, option.first_name, option.middle_name]
                  .filter(Boolean)
                  .join(" ")}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Пацієнт"
                size="small"
                placeholder="Пошук пацієнта..."
                autoComplete="off"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password",
                  "data-lpignore": "true",
                  "data-1p-ignore": "true",
                }}
              />
            )}
            noOptionsText="Пацієнтів не знайдено"
          />

          <Button variant="outlined" onClick={handleOpenCreatePatientModal}>
            Додати нового пацієнта
          </Button>

          <TextField
            label="Статус"
            select
            value={bookingFormValues.status}
            onChange={handleBookingFieldChange("status")}
            fullWidth
            size="small"
          >
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            label="Тип прийому"
            value={bookingFormValues.appointment_type}
            onChange={handleBookingFieldChange("appointment_type")}
            fullWidth
            size="small"
          />
          <TextField
            label="Причина скасування"
            value={bookingFormValues.cancellation_reason}
            onChange={handleBookingFieldChange("cancellation_reason")}
            fullWidth
            size="small"
            disabled={bookingFormValues.status !== "Cancelled"}
            sx={{ display: selectedAppointment ? "block" : "none" }}
          />
          <TextField
            label="Нотатки"
            value={bookingFormValues.notes}
            onChange={handleBookingFieldChange("notes")}
            autoComplete="off"
            inputProps={{
              autoComplete: "new-password",
              "data-lpignore": "true",
              "data-1p-ignore": "true",
            }}
            fullWidth
            size="small"
            multiline
            minRows={3}
          />
        </Box>
      </Modal>

      <PatientsForm
        key={isCreatePatientModalOpen ? "create-patient-open" : "create-patient-closed"}
        open={isCreatePatientModalOpen}
        mode={PATIENT_FORM_MODES.CREATE}
        initialValues={null}
        isLoading={isPatientsLoading}
        onClose={handleCloseCreatePatientModal}
        onSubmit={handleCreatePatientSubmit}
      />
    </Box>
  );
}

export default Schedule;
