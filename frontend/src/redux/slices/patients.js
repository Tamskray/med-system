import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const API_BASE_URL = "http://localhost:5000/api";

const pickPatientPayload = (patient = {}) => ({
  last_name: patient.last_name,
  first_name: patient.first_name,
  middle_name: patient.middle_name,
  date_of_birth: patient.date_of_birth,
  phone: patient.phone,
  email: patient.email,
});

const normalizePatient = (patient = {}) => ({
  id: patient.id ?? null,
  last_name: patient.last_name ?? "",
  first_name: patient.first_name ?? "",
  middle_name: patient.middle_name ?? "",
  date_of_birth: patient.date_of_birth ?? null,
  phone: patient.phone ?? "",
  email: patient.email ?? "",
  created_at: patient.created_at ?? null,
});

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      return (data.data || []).map(normalizePatient);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createPatient = createAsyncThunk(
  "patients/createPatient",
  async (patientData, { rejectWithValue }) => {
    try {
      const payload = pickPatientPayload(patientData);
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create patient");
      const data = await response.json();
      return normalizePatient(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updatePatient = createAsyncThunk(
  "patients/updatePatient",
  async ({ id, ...patientData }, { rejectWithValue }) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(pickPatientPayload(patientData)).filter(([, value]) => value !== undefined),
      );
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update patient");
      const data = await response.json();
      return normalizePatient(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deletePatient = createAsyncThunk(
  "patients/deletePatient",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete patient");
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  patients: [],
  isLoading: false,
  error: null,
};

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to fetch patients");
      })
      .addCase(createPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.patients.push(action.payload);
        showSuccessToast("Patient created successfully");
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to create patient");
      })
      .addCase(updatePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const index = state.patients.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        showSuccessToast("Patient updated successfully");
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to update patient");
      })
      .addCase(deletePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.patients = state.patients.filter((p) => p.id !== action.payload.id);
        showSuccessToast("Patient deleted successfully");
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to delete patient");
      });
  },
});

export const { clearError } = patientsSlice.actions;
export default patientsSlice.reducer;
