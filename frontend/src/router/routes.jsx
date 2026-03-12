import { lazy } from "react";

const Login = lazy(() => import("../pages/Login"));
const Doctors = lazy(() => import("../pages/Doctors"));
const Patients = lazy(() => import("../pages/Patients"));

export const routes = [
  {
    path: "/",
    element: <Login />,
    private: false,
  },
  {
    path: "/doctors",
    element: <Doctors />,
    private: true,
  },
  {
    path: "/patients",
    element: <Patients />,
    private: true,
  },
];
