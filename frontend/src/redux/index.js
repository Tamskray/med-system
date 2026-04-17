import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import doctorsReducer from "./slices/doctors";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
  },
});
