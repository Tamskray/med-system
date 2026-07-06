import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

export const fetchPatientProfileData = createAsyncThunk(
  "patientProfile/fetchAll",
  async ({ patientId, isDoctor }, { rejectWithValue }) => {
    try {
      const requests = [
        apiFetch(`${API_BASE_URL}/patients/${encodeURIComponent(patientId)}`),
        apiFetch(`${API_BASE_URL}/appointments?patient_id=${encodeURIComponent(patientId)}`),
        isDoctor
          ? apiFetch(`${API_BASE_URL}/medical-records?patient_id=${encodeURIComponent(patientId)}`)
          : Promise.resolve(null),
      ];

      const [patientRes, appointmentsRes, recordsRes] = await Promise.all(requests);

      if (!patientRes.ok) throw new Error("Не вдалося завантажити профіль пацієнта");
      if (!appointmentsRes.ok) throw new Error("Не вдалося завантажити історію візитів");
      if (isDoctor && recordsRes && !recordsRes.ok)
        throw new Error("Не вдалося завантажити медичну картку");

      const patientResult = await patientRes.json();
      const appointmentsResult = await appointmentsRes.json();
      const recordsResult = isDoctor && recordsRes ? await recordsRes.json() : null;

      return {
        patient: patientResult.data || null,
        appointments: appointmentsResult.data || [],
        medicalRecords: recordsResult?.data || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateAppointmentStatus = createAsyncThunk(
  "patientProfile/updateAppointmentStatus",
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Не вдалося оновити статус");
      return { appointmentId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createMedicalRecord = createAsyncThunk(
  "patientProfile/createMedicalRecord",
  async (recordData, { rejectWithValue }) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData),
      });
      if (!response.ok) throw new Error("Не вдалося зберегти медичний запис");
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  patient: null,
  appointments: [],
  medicalRecords: [],
  isLoading: false,
  isSavingRecord: false,
  error: null,
};

const patientProfileSlice = createSlice({
  name: "patientProfile",
  initialState,
  reducers: {
    clearPatientProfile: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patient = action.payload.patient;
        state.appointments = action.payload.appointments;
        state.medicalRecords = action.payload.medicalRecords;
      })
      .addCase(fetchPatientProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Помилка завантаження даних");
      })

      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const { appointmentId, status } = action.payload;
        const appointment = state.appointments.find((a) => a.id === appointmentId);
        if (appointment) appointment.status = status;
        showSuccessToast("Статус візиту оновлено");
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        showErrorToast(action.payload || "Не вдалося оновити статус");
      })

      .addCase(createMedicalRecord.pending, (state) => {
        state.isSavingRecord = true;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.isSavingRecord = false;
        state.medicalRecords.unshift(action.payload);
        showSuccessToast("Медичний запис збережено");
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.isSavingRecord = false;
        showErrorToast(action.payload || "Не вдалося зберегти запис");
      });
  },
});

export const { clearPatientProfile } = patientProfileSlice.actions;
export default patientProfileSlice.reducer;
