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
  "/admin/users": "Користувачі",
};

function App() {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const { open, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isSchedulePage = location.pathname === "/schedule";
  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.startsWith("/patients/") ? "Профіль пацієнта" : "MED System");

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
              transition: "width 0.3s ease",
              overflowY: "auto",
            }}
          >
            <Sidebar open={open} toggleSidebar={toggleSidebar} />
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          {user && <TopNavbar pageName={pageName} user={user} onLogout={handleLogout} />}

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              position: "relative",
              isolation: "isolate",
              ...(isSchedulePage
                ? {}
                : {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      width: 240,
                      height: 240,
                      right: -90,
                      bottom: -110,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 35%, rgba(33, 150, 243, 0.22), rgba(33, 150, 243, 0))",
                      pointerEvents: "none",
                      zIndex: 0,
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: 180,
                      height: 180,
                      right: 70,
                      bottom: -80,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 65% 65%, rgba(0, 150, 136, 0.18), rgba(0, 150, 136, 0))",
                      pointerEvents: "none",
                      zIndex: 0,
                    },
                  }),
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                overflow: "auto",
                ...(user ? { paddingX: 3, paddingY: 3 } : {}),
              }}
            >
              <AppRouter user={user} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
