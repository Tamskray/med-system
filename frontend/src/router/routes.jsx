import { lazy } from "react";

const Login = lazy(() => import("../pages/Login"));
const Schedule = lazy(() => import("../pages/Schedule"));
const Doctors = lazy(() => import("../pages/Doctors"));
const Patients = lazy(() => import("../pages/Patients"));
const DoctorDashboard = lazy(() => import("../pages/DoctorDashboard"));
const PatientProfile = lazy(() => import("../pages/PatientProfile"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));

export const routes = [
  {
    path: "/",
    element: <Login />,
    private: false,
    restricted: true,
  },
  {
    path: "/schedule",
    element: <Schedule />,
    private: true,
    module: "appointments",
  },
  {
    path: "/doctors",
    element: <Doctors />,
    private: true,
    module: "doctors",
  },
  {
    path: "/patients",
    element: <Patients />,
    private: true,
    module: "patients",
  },
  {
    path: "/patients/:id",
    element: <PatientProfile />,
    private: true,
    module: "patients",
  },
  {
    path: "/doctor-dashboard",
    element: <DoctorDashboard />,
    private: true,
    module: "doctor_schedule",
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
    private: true,
    module: "users",
  },
];
