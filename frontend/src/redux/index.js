import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/auth";
import devModeReducer from "./slices/devMode";
import doctorsReducer from "./slices/doctors";
import patientProfileReducer from "./slices/patientProfile";
import patientsReducer from "./slices/patients";
import scheduleReducer from "./slices/schedule";

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
