import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const storedToken = localStorage.getItem("token");
const tokenValid = !isTokenExpired(storedToken);

if (!tokenValid) {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ name, password }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_identifier: name,
          password,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        return rejectWithValue(result?.message || "Помилка входу");
      }

      return {
        token: result.token,
        ...result.user,
        permissions: result.permissions || {},
      };
    } catch (error) {
      return rejectWithValue(error?.message || "Помилка входу");
    }
  },
);

const initialState = {
  user: tokenValid ? JSON.parse(localStorage.getItem("user")) : null,
  token: tokenValid ? storedToken : null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
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
        state.token = action.payload.token;
        localStorage.setItem("user", JSON.stringify(action.payload));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
