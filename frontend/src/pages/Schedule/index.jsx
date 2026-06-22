import { useMemo, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../../redux/slices/doctors";
import { fetchPatients, createPatient } from "../../redux/slices/patients";
import { useAccess } from "../../hooks/useAccess";
import Tooltip from "../../components/core/Tooltip";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import AppointmentForm from "./AppointmentForm";
import ScheduleFilters from "./Filters";
import { showErrorToast } from "../../utils/toast";
import { getTodayIsoDate, shiftIsoDate, timeToMinutes, minutesToTime } from "../../utils/dates";
import {
  getAppointmentPatientFullName,
  getSlotPalette,
  getSlotTooltipContent,
  getTimeOffLabel,
} from "./utils/schedule";
import {
  deleteScheduleAppointment,
  fetchScheduleAppointments,
  fetchScheduleTimeOffs,
  fetchScheduleWorkingHours,
  receiveStreamAppointment,
  receiveStreamTimeOff,
  saveScheduleAppointment,
  updateStreamAppointmentStatus,
} from "../../redux/slices/schedule";
import PatientsForm from "../Patients/PatientsForm";
import { PATIENT_FORM_MODES } from "../Patients/constants";
import {
  DAY_START,
  DAY_END,
  AXIS_STEP_MINUTES,
  BASE_SLOT_MINUTES,
  DAY_START_MINUTES,
  DAY_END_MINUTES,
  BREAK,
  DEFAULT_BOOKING_FORM_VALUES,
} from "./constants";
import {
  pageWrapperSx,
  timeTitleSx,
  timeWeekdaySx,
  getPaperSx,
  getTableWrapperSx,
  tableHeaderRowSx,
  tableHeaderLabelCellSx,
  axisHeaderGridSx,
  axisHourCellSx,
  loadingBoxSx,
  departmentBannerSx,
  departmentLabelSx,
  doctorRowSx,
  doctorInfoCellSx,
  doctorNameSx,
  getTimelineBodySx,
  getSlotBoxSx,
  slotPlusIconSx,
  slotTimeSx,
  slotStatusSx,
  slotPatientNameSx,
  emptyStateBoxSx,
} from "./styles";

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

const isPastSlot = (selectedDate, slotStart, currentTime, devMode) => {
  if (devMode) return false;

  const today = getTodayIsoDate();
  const isToday = selectedDate === today;
  const isPastDate = selectedDate < today;

  if (isPastDate) return true;

  if (isToday) {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const slotMinutes = timeToMinutes(slotStart);
    return slotMinutes < currentMinutes;
  }

  return false;
};

const doesTimeOffCoverDate = (timeOff, isoDate) => {
  if (!timeOff?.start_time || !timeOff?.end_time || !isoDate) return false;

  const dayStart = `${isoDate}T00:00:00.000Z`;
  const dayEnd = `${shiftIsoDate(isoDate, 1)}T00:00:00.000Z`;

  return String(timeOff.start_time) < dayEnd && String(timeOff.end_time) > dayStart;
};

function Schedule() {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);
  const { patients, isLoading: isPatientsLoading } = useSelector((state) => state.patients);
  const devMode = useSelector((state) => state.devMode.enabled);
  const {
    appointments,
    workingHoursByDoctorId,
    timeOffsByDoctorId,
    isAppointmentsLoading,
    isWorkingHoursLoading,
    isTimeOffsLoading,
    isBookingSubmitting,
  } = useSelector((state) => state.schedule);
  const access = useAccess("appointments");
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [isBookingSubmitAttempted, setIsBookingSubmitAttempted] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingFormValues, setBookingFormValues] = useState({
    ...DEFAULT_BOOKING_FORM_VALUES,
  });
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPatientSearch(patientSearchInput);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [patientSearchInput]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const streamUrl = token
      ? `/api/appointments/stream?token=${encodeURIComponent(token)}`
      : "/api/appointments/stream";
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { action, data } = payload || {};

        if (action === "CREATE") {
          dispatch(receiveStreamAppointment(data));
        }

        if (action === "UPDATE_STATUS") {
          dispatch(updateStreamAppointmentStatus(data));
        }

        if (action === "TIME_OFF_CREATED" && doesTimeOffCoverDate(data, selectedDate)) {
          dispatch(receiveStreamTimeOff(data));
        }
      } catch {
        // Ignore malformed SSE messages and keep current UI state.
      }
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch, selectedDate]);

  useEffect(() => {
    dispatch(fetchScheduleAppointments(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    const doctorIds = (doctors || []).map((doctor) => doctor.id).filter(Boolean);
    dispatch(fetchScheduleWorkingHours({ selectedDate, doctorIds }));
  }, [dispatch, doctors, selectedDate]);

  useEffect(() => {
    const doctorIds = (doctors || []).map((doctor) => doctor.id).filter(Boolean);
    dispatch(fetchScheduleTimeOffs({ selectedDate, doctorIds }));
  }, [dispatch, doctors, selectedDate]);

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

  const allDoctors = useMemo(
    () => Object.values(doctorsByDepartment).flat(),
    [doctorsByDepartment],
  );

  const filteredDoctorsByDepartment = useMemo(() => {
    const patientNeedle = patientSearch.trim().toLowerCase();

    let filtered = { ...doctorsByDepartment };

    // Filter by department
    if (selectedDepartment) {
      filtered = {
        [selectedDepartment]: filtered[selectedDepartment] || [],
      };
    }

    // Filter by doctor
    if (selectedDoctorId) {
      filtered = Object.entries(filtered).reduce((groups, [departmentName, departmentDoctors]) => {
        const filteredDoctors = departmentDoctors.filter(
          (doctor) => Number(doctor.id) === Number(selectedDoctorId),
        );
        if (filteredDoctors.length) {
          groups[departmentName] = filteredDoctors;
        }
        return groups;
      }, {});
    }

    // Filter by patient
    if (patientNeedle) {
      filtered = Object.entries(filtered).reduce((groups, [departmentName, departmentDoctors]) => {
        const filteredDoctors = departmentDoctors.filter((doctor) =>
          appointments.some((appointment) => {
            if (Number(appointment.doctor_id) !== Number(doctor.id)) return false;
            if (appointment.status === "Скасовано") return false;

            return getAppointmentPatientFullName(appointment).toLowerCase().includes(patientNeedle);
          }),
        );
        if (filteredDoctors.length) {
          groups[departmentName] = filteredDoctors;
        }
        return groups;
      }, {});
    }

    return filtered;
  }, [appointments, selectedDoctorId, selectedDepartment, patientSearch, doctorsByDepartment]);

  // Header must use the same time range as the slot grid to avoid horizontal drift.
  const axisHours = useMemo(() => getTimeAxis(DAY_START, DAY_END).slice(0, -1), []);

  const openBookingModal = (doctor, block) => {
    setSelectedSlot({
      doctorId: doctor.id,
      doctorName: [doctor.last_name, doctor.first_name].filter(Boolean).join(" "),
      departmentName: doctor.departments?.name || doctor.department_name || "Без відділення",
      roomNumber: doctor.rooms?.room_number || doctor.room_number || "—",
      start: block.start,
      end: block.end,
    });
    setBookingFormValues({ ...DEFAULT_BOOKING_FORM_VALUES });
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
      status: appointment.status || DEFAULT_BOOKING_FORM_VALUES.status,
      appointment_type:
        appointment.appointment_type || DEFAULT_BOOKING_FORM_VALUES.appointment_type,
      cancellation_reason: appointment.cancellation_reason || "",
      notes: appointment.notes || "",
    });
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedSlot(null);
    setSelectedAppointment(null);
    setIsBookingSubmitAttempted(false);
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

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await dispatch(deleteScheduleAppointment(appointmentId)).unwrap();
      setDeleteConfirmationOpen(false);
      setAppointmentToDelete(null);
    } catch {
      // Error toast is handled in the redux slice.
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) return;
    setIsBookingSubmitAttempted(true);
    const isBreak = bookingFormValues.appointment_type === BREAK;
    if (!isBreak && !bookingFormValues.patient_id) return;

    try {
      await dispatch(
        saveScheduleAppointment({
          appointmentId: selectedAppointment?.id ?? null,
          doctorId: selectedSlot.doctorId,
          selectedDate: selectedAppointment?.appointment_date || selectedDate,
          selectedSlot,
          bookingFormValues,
        }),
      ).unwrap();
      handleCloseBookingModal();
    } catch {
      // Error toast is handled in the redux slice.
    }
  };

  const getAppointmentForSlot = (doctorId, block) => {
    return (
      appointments.find((appointment) => {
        if (Number(appointment.doctor_id) !== Number(doctorId)) return false;
        // if we need to show cancelled appoitnments
        if (appointment.status === "Скасовано") return false;

        const startTime = String(appointment.start_time || "").slice(11, 16);
        const endTime = String(appointment.end_time || "").slice(11, 16);

        return startTime === block.start && endTime === block.end;
      }) || null
    );
  };

  const isScheduleLoading = isAppointmentsLoading || isWorkingHoursLoading || isTimeOffsLoading;

  return (
    <Box sx={pageWrapperSx}>
      <Typography variant="h4" sx={timeTitleSx}>
        {currentTime.toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        <Typography component="span" variant="h6" sx={timeWeekdaySx}>
          {(() => {
            const weekday = currentTime.toLocaleDateString("uk-UA", { weekday: "long" });
            return weekday.charAt(0).toUpperCase() + weekday.slice(1);
          })()}
        </Typography>
      </Typography>

      <ScheduleFilters
        selectedDate={selectedDate}
        onPreviousDay={() => setSelectedDate((prev) => shiftIsoDate(prev, -1))}
        onNextDay={() => setSelectedDate((prev) => shiftIsoDate(prev, 1))}
        onDateChange={(value) => setSelectedDate(value)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(e) => {
          setSelectedDepartment(e.target.value);
          setSelectedDoctorId(null);
        }}
        departmentOptions={Object.keys(doctorsByDepartment).sort()}
        selectedDoctorId={selectedDoctorId}
        onDoctorChange={(_, doctor) => setSelectedDoctorId(doctor?.id ?? null)}
        doctorOptions={
          selectedDepartment ? doctorsByDepartment[selectedDepartment] || [] : allDoctors
        }
        patientSearchInput={patientSearchInput}
        onPatientSearchInputChange={(e) => setPatientSearchInput(e.target.value)}
      />

      <Paper variant="outlined" sx={getPaperSx(isScheduleLoading)}>
        <Box sx={getTableWrapperSx(isScheduleLoading)}>
          {!isScheduleLoading && (
            <Box sx={tableHeaderRowSx}>
              <Box sx={tableHeaderLabelCellSx}>
                <Typography variant="subtitle2" color="text.secondary">
                  Лікар / Кабінет
                </Typography>
              </Box>
              <Box sx={axisHeaderGridSx}>
                {axisHours.map((hour) => {
                  return (
                    <Box key={hour} sx={axisHourCellSx}>
                      {hour}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {isScheduleLoading ? (
            <Box sx={loadingBoxSx}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <>
              {Object.entries(filteredDoctorsByDepartment).map(
                ([departmentName, departmentDoctors]) => (
                  <Box key={departmentName}>
                    <Box sx={departmentBannerSx}>
                      <Box sx={departmentLabelSx}>
                        <Typography variant="subtitle2">{departmentName}</Typography>
                      </Box>
                    </Box>

                    {departmentDoctors.map((doctor) => {
                      const slotDuration =
                        doctor.active_slot_duration ?? doctor.slot_duration_override ?? 30;
                      const doctorWorkingHours = workingHoursByDoctorId[doctor.id];
                      const doctorTimeOff = timeOffsByDoctorId[doctor.id] || null;
                      const isDoctorActive = Boolean(doctor.is_active);
                      const isDoctorWorking =
                        isDoctorActive &&
                        !doctorTimeOff &&
                        Boolean(doctorWorkingHours?.start) &&
                        Boolean(doctorWorkingHours?.end);
                      const timeBlocks = isDoctorWorking
                        ? generateTimeBlocks(
                            doctorWorkingHours.start,
                            doctorWorkingHours.end,
                            slotDuration,
                          ).filter((block) => {
                            const blockStart = timeToMinutes(block.start);
                            const blockEnd = timeToMinutes(block.end);
                            return blockStart >= DAY_START_MINUTES && blockEnd <= DAY_END_MINUTES;
                          })
                        : [];

                      return (
                        <Box key={doctor.id} sx={doctorRowSx}>
                          <Box sx={doctorInfoCellSx}>
                            <Typography variant="body2" sx={doctorNameSx}>
                              {doctor.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Кабінет: {doctor.rooms?.room_number || doctor.room_number || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Слот: {slotDuration} хв
                            </Typography>
                          </Box>

                          <Box sx={getTimelineBodySx(isDoctorWorking)}>
                            {!isDoctorWorking && (
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="caption" color="text.secondary">
                                  {getTimeOffLabel(doctorTimeOff)}
                                </Typography>
                              </Box>
                            )}

                            {timeBlocks.map((block, slotIndex) => {
                              const appointment = getAppointmentForSlot(doctor.id, block);
                              const occupied = Boolean(appointment);
                              const isPast = isPastSlot(
                                selectedDate,
                                block.start,
                                currentTime,
                                devMode,
                              );
                              const palette = getSlotPalette(appointment, slotIndex);
                              const slotStatus = occupied
                                ? appointment.status || "Заплановано"
                                : "Вільно";

                              const span = slotDuration / BASE_SLOT_MINUTES;
                              const startColumn =
                                Math.floor(
                                  (timeToMinutes(block.start) - DAY_START_MINUTES) /
                                    BASE_SLOT_MINUTES,
                                ) + 1;

                              return (
                                <Tooltip
                                  key={`${doctor.id}-${block.start}`}
                                  title={
                                    !occupied && isPast
                                      ? "Минула дата"
                                      : getSlotTooltipContent(
                                          block,
                                          occupied,
                                          appointment,
                                          getAppointmentPatientFullName,
                                          access.create,
                                        )
                                  }
                                  enterDelay={180}
                                >
                                  <Box
                                    onClick={() => {
                                      if (occupied && access.update) {
                                        if (appointment.appointment_type === BREAK) {
                                          setAppointmentToDelete(appointment);
                                          setDeleteConfirmationOpen(true);
                                        } else {
                                          openEditAppointmentModal(doctor, block, appointment);
                                        }
                                      } else if (!occupied && !isPast && access.create) {
                                        openBookingModal(doctor, block);
                                      }
                                    }}
                                    sx={getSlotBoxSx({
                                      startColumn,
                                      span,
                                      occupied,
                                      isPast,
                                      canCreate: access.create,
                                      canUpdate: access.update,
                                      palette,
                                    })}
                                  >
                                    {!occupied && !isPast && access.create && (
                                      <Typography sx={slotPlusIconSx}>+</Typography>
                                    )}
                                    <Typography sx={slotTimeSx}>{block.start}</Typography>
                                    <Typography sx={slotStatusSx}>{slotStatus}</Typography>
                                    {occupied && (
                                      <Typography sx={slotPatientNameSx}>
                                        {appointment.appointment_type === BREAK
                                          ? "Перерва"
                                          : getAppointmentPatientFullName(appointment)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ),
              )}

              {!isLoading && Object.keys(filteredDoctorsByDepartment).length === 0 && (
                <Box sx={emptyStateBoxSx}>
                  <Typography color="text.secondary">
                    Немає даних для відображення за поточними фільтрами.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>

      <AppointmentForm
        open={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
        onDelete={handleDeleteAppointment}
        selectedAppointment={selectedAppointment}
        selectedSlot={selectedSlot}
        selectedDate={selectedDate}
        patients={patients}
        isPatientsLoading={isPatientsLoading}
        isSubmitting={isBookingSubmitting}
        isSubmitAttempted={isBookingSubmitAttempted}
        formValues={bookingFormValues}
        onFieldChange={handleBookingFieldChange}
        onPatientChange={handlePatientSelectionChange}
        onAddPatient={handleOpenCreatePatientModal}
      />

      <PatientsForm
        key={isCreatePatientModalOpen ? "create-patient-open" : "create-patient-closed"}
        open={isCreatePatientModalOpen}
        mode={PATIENT_FORM_MODES.CREATE}
        initialValues={null}
        isLoading={isPatientsLoading}
        onClose={handleCloseCreatePatientModal}
        onSubmit={handleCreatePatientSubmit}
      />

      <DeleteConfirmModal
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => handleDeleteAppointment(appointmentToDelete?.id)}
        title="Видалити перерву?"
        submitText="Видалити"
        cancelText="Скасувати"
        customWarningText={
          <>Ви впевнені, що хочете видалити цю перерву? Цю дію не можна скасувати.</>
        }
      />
    </Box>
  );
}

export default Schedule;
