import Box from "@mui/material/Box";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router";

import AppRouter from "./router/AppRouter";
import Sidebar from "./components/core/Sidebar";
import { useSidebar } from "./components/core/Sidebar/hooks";
import TopNavbar from "./components/core/TopNavbar";

import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "./redux/selectors/authSelector";
import { logout } from "./redux/slices/auth";

const pageNames = {
  "/schedule": "Розклад",
  "/doctor-dashboard": "Розклад лікаря",
  "/doctors": "Лікарі",
  "/patients": "Пацієнти",
};

function App() {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { open, toggleSidebar } = useSidebar();
  const location = useLocation();
  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.startsWith("/patients/") ? "Patient Profile" : "MED System");

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} gutter={8} />
      <Box sx={{ display: "flex", height: "100vh" }}>
        {user && (
          <Box
            sx={{
              width: open ? 220 : 80,
              flexShrink: 0,
              backgroundColor: "background.default",
              borderRight: "1px solid",
              borderColor: "divider",
              paddingY: 2,
              transition: "width 0.3s ease",
              overflowY: "auto",
            }}
          >
            <Sidebar open={open} toggleSidebar={toggleSidebar} />
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          {user && <TopNavbar pageName={pageName} user={user} onLogout={handleLogout} />}

          <Box sx={{ flex: 1, minWidth: 0, overflow: "auto", paddingX: 3, paddingY: 3 }}>
            <AppRouter user={user} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
