import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const API_BASE_URL = "http://localhost:5000/api";

const pickDoctorPayload = (doctor = {}) => ({
  last_name: doctor.last_name,
  first_name: doctor.first_name,
  middle_name: doctor.middle_name,
  department_id: doctor.department_id,
  room_id: doctor.room_id,
  slot_duration_override: doctor.slot_duration_override,
  is_active: doctor.is_active,
});

const normalizeDoctor = (doctor = {}) => ({
  id: doctor.id ?? null,
  user_id: doctor.user_id ?? null,
  last_name: doctor.last_name ?? "",
  first_name: doctor.first_name ?? "",
  middle_name: doctor.middle_name ?? "",
  department_id: doctor.department_id ?? null,
  room_id: doctor.room_id ?? null,
  slot_duration_override: doctor.slot_duration_override ?? null,
  is_active: doctor.is_active ?? true,
  departments: doctor.departments ?? null,
  department_name: doctor.departments?.name ?? null,
  rooms: doctor.rooms ?? null,
  room_number: doctor.rooms?.room_number ?? null,
});

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      return (data.data || []).map(normalizeDoctor);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createDoctor = createAsyncThunk(
  "doctors/createDoctor",
  async (doctorData, { rejectWithValue }) => {
    try {
      const payload = pickDoctorPayload(doctorData);
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create doctor");
      const data = await response.json();
      return normalizeDoctor(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateDoctor = createAsyncThunk(
  "doctors/updateDoctor",
  async ({ id, ...doctorData }, { rejectWithValue }) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(pickDoctorPayload(doctorData)).filter(([, value]) => value !== undefined),
      );

      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update doctor");
      const data = await response.json();
      return normalizeDoctor(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteDoctor = createAsyncThunk(
  "doctors/deleteDoctor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete doctor");
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  doctors: [],
  isLoading: false,
  error: null,
};

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to fetch doctors");
      })
      .addCase(createDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.doctors.push(action.payload);
        showSuccessToast("Doctor created successfully");
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to create doctor");
      })
      .addCase(updateDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const index = state.doctors.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        showSuccessToast("Doctor updated successfully");
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to update doctor");
      })
      .addCase(deleteDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.doctors = state.doctors.filter((d) => d.id !== action.payload.id);
        showSuccessToast("Doctor deleted successfully");
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showErrorToast(action.payload || "Failed to delete doctor");
      });
  },
});

export const { clearError } = doctorsSlice.actions;
export default doctorsSlice.reducer;
