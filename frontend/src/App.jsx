import Box from "@mui/material/Box";

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
  "/schedule": "Schedule",
  "/doctors": "Doctors",
  "/patients": "Patients",
};

function App() {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { open, toggleSidebar } = useSidebar();
  const location = useLocation();
  const pageName = pageNames[location.pathname] || "MED System";

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {user && (
        <Box
          sx={{
            width: open ? 220 : 80,
            backgroundColor: "#fafafa",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            paddingY: 2,
            transition: "width 0.3s ease",
            overflowY: "auto",
          }}
        >
          <Sidebar open={open} toggleSidebar={toggleSidebar} />
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {user && <TopNavbar pageName={pageName} user={user} onLogout={handleLogout} />}

        <Box sx={{ flex: 1, overflow: "auto", paddingX: 3, paddingY: 3 }}>
          <AppRouter user={user} />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
