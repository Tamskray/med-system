import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import doctorsReducer from "./slices/doctors";
import patientsReducer from "./slices/patients";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    patients: patientsReducer,
  },
});
