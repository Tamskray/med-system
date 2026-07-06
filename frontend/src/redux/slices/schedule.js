import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { getDbDayOfWeekFromIsoDate } from "../../utils/dates";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

export const fetchScheduleAppointments = createAsyncThunk(
  "schedule/fetchAppointments",
  async (selectedDate, { rejectWithValue }) => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/appointments?date=${encodeURIComponent(selectedDate)}`,
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchScheduleWorkingHours = createAsyncThunk(
  "schedule/fetchWorkingHours",
  async ({ selectedDate, doctorIds = [] }, { rejectWithValue }) => {
    if (!doctorIds.length) return {};

    try {
      const dayOfWeek = getDbDayOfWeekFromIsoDate(selectedDate);
      const params = new URLSearchParams({
        dayOfWeek: String(dayOfWeek),
        doctorIds: doctorIds.join(","),
      });
      const response = await apiFetch(`${API_BASE_URL}/working-hours?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch working hours");
      }

      const result = await response.json();
      const rows = Array.isArray(result.data) ? result.data : [];
      const hoursByDoctor = doctorIds.reduce((acc, doctorId) => {
        acc[doctorId] = null;
        return acc;
      }, {});

      rows.forEach((workingHour) => {
        const doctorId = workingHour.doctor_id;
        if (!doctorId || hoursByDoctor[doctorId]) return;

        hoursByDoctor[doctorId] = {
          start: String(workingHour.start_time || "").slice(0, 5),
          end: String(workingHour.end_time || "").slice(0, 5),
        };
      });

      return hoursByDoctor;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchScheduleTimeOffs = createAsyncThunk(
  "schedule/fetchTimeOffs",
  async ({ selectedDate, doctorIds = [] }, { rejectWithValue }) => {
    if (!doctorIds.length) return {};

    try {
      const params = new URLSearchParams({
        date: selectedDate,
        doctorIds: doctorIds.join(","),
      });
      const response = await apiFetch(`${API_BASE_URL}/doctors/time-offs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch doctor time offs");
      }

      const result = await response.json();
      const rows = Array.isArray(result.data) ? result.data : [];

      return rows.reduce((acc, timeOff) => {
        if (timeOff?.doctor_id && !acc[timeOff.doctor_id]) {
          acc[timeOff.doctor_id] = timeOff;
        }
        return acc;
      }, {});
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveScheduleAppointment = createAsyncThunk(
  "schedule/saveAppointment",
  async (
    { appointmentId, doctorId, selectedDate, selectedSlot, bookingFormValues },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        patient_id: bookingFormValues.patient_id,
        appointment_date: appointmentId ? selectedDate : selectedDate,
        start_time: `${selectedDate}T${selectedSlot.start}:00.000Z`,
        end_time: `${selectedDate}T${selectedSlot.end}:00.000Z`,
        appointment_type: bookingFormValues.appointment_type || "Консультація",
        status: bookingFormValues.status || "Заплановано",
        cancellation_reason: bookingFormValues.cancellation_reason || null,
        notes: bookingFormValues.notes,
      };

      const isEditMode = Boolean(appointmentId);
      const requestPayload = isEditMode ? payload : { ...payload, doctor_id: doctorId };

      const response = await apiFetch(
        isEditMode
          ? `${API_BASE_URL}/appointments/${appointmentId}`
          : `${API_BASE_URL}/appointments`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        },
      );

      if (!response.ok) {
        const fallbackMessage = isEditMode
          ? "Failed to update appointment"
          : "Failed to create appointment";
        let serverMessage = fallbackMessage;

        try {
          const errorResult = await response.json();
          serverMessage = errorResult?.message || fallbackMessage;
        } catch {
          serverMessage = fallbackMessage;
        }

        throw new Error(serverMessage);
      }

      const result = await response.json();
      return { appointment: result.data, isEditMode };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteScheduleAppointment = createAsyncThunk(
  "schedule/deleteAppointment",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      return appointmentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  appointments: [],
  workingHoursByDoctorId: {},
  timeOffsByDoctorId: {},
  isAppointmentsLoading: false,
  isWorkingHoursLoading: false,
  isTimeOffsLoading: false,
  isBookingSubmitting: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    receiveStreamAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateStreamAppointmentStatus: (state, action) => {
      state.appointments = state.appointments.map((appointment) =>
        appointment.id === action.payload.id
          ? { ...appointment, status: action.payload.status }
          : appointment,
      );
    },
    receiveStreamTimeOff: (state, action) => {
      if (action.payload?.doctor_id) {
        state.timeOffsByDoctorId[action.payload.doctor_id] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScheduleAppointments.pending, (state) => {
        state.isAppointmentsLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduleAppointments.fulfilled, (state, action) => {
        state.isAppointmentsLoading = false;
        state.error = null;
        state.appointments = action.payload;
      })
      .addCase(fetchScheduleAppointments.rejected, (state, action) => {
        state.isAppointmentsLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to fetch appointments");
      })
      .addCase(fetchScheduleWorkingHours.pending, (state) => {
        state.isWorkingHoursLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduleWorkingHours.fulfilled, (state, action) => {
        state.isWorkingHoursLoading = false;
        state.error = null;
        state.workingHoursByDoctorId = action.payload;
      })
      .addCase(fetchScheduleWorkingHours.rejected, (state, action) => {
        state.isWorkingHoursLoading = false;
        state.error = action.payload;
        state.workingHoursByDoctorId = {};
        showErrorToast(action.payload || "Failed to fetch working hours");
      })
      .addCase(fetchScheduleTimeOffs.pending, (state) => {
        state.isTimeOffsLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduleTimeOffs.fulfilled, (state, action) => {
        state.isTimeOffsLoading = false;
        state.error = null;
        state.timeOffsByDoctorId = action.payload;
      })
      .addCase(fetchScheduleTimeOffs.rejected, (state, action) => {
        state.isTimeOffsLoading = false;
        state.error = action.payload;
        state.timeOffsByDoctorId = {};
        showErrorToast(action.payload || "Failed to fetch doctor time offs");
      })
      .addCase(saveScheduleAppointment.pending, (state) => {
        state.isBookingSubmitting = true;
        state.error = null;
      })
      .addCase(saveScheduleAppointment.fulfilled, (state, action) => {
        state.isBookingSubmitting = false;
        state.error = null;
        const { appointment, isEditMode } = action.payload;

        if (isEditMode) {
          state.appointments = state.appointments.map((currentAppointment) =>
            currentAppointment.id === appointment.id ? appointment : currentAppointment,
          );
          showSuccessToast("Запис оновлено");
          return;
        }

        state.appointments.push(appointment);
        showSuccessToast("Запис успішно створено");
      })
      .addCase(saveScheduleAppointment.rejected, (state, action) => {
        state.isBookingSubmitting = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to save appointment");
      })
      .addCase(deleteScheduleAppointment.pending, (state) => {
        state.isBookingSubmitting = true;
        state.error = null;
      })
      .addCase(deleteScheduleAppointment.fulfilled, (state, action) => {
        state.isBookingSubmitting = false;
        state.error = null;
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload,
        );
        showSuccessToast("Запис видалено");
      })
      .addCase(deleteScheduleAppointment.rejected, (state, action) => {
        state.isBookingSubmitting = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to delete appointment");
      });
  },
});

export const { receiveStreamAppointment, updateStreamAppointmentStatus, receiveStreamTimeOff } =
  scheduleSlice.actions;

export default scheduleSlice.reducer;
