import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import doctorsReducer from "./slices/doctors";
import patientsReducer from "./slices/patients";
import devModeReducer from "./slices/devMode";
import scheduleReducer from "./slices/schedule";
import patientProfileReducer from "./slices/patientProfile";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    patients: patientsReducer,
    devMode: devModeReducer,
    schedule: scheduleReducer,
    patientProfile: patientProfileReducer,
  },
});
