import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const login = createAsyncThunk(
  "auth/login",
  async ({ name, password }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && password === "123") {
          resolve({ id: "1", name, role: "admin", permissions: ["all-permissions"] });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    }).catch((error) => rejectWithValue(error.message));
  },
);

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
