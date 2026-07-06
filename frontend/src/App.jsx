import { useLocation } from "react-router";

import { Toaster } from "react-hot-toast";

import Box from "@mui/material/Box";

import { useDispatch, useSelector } from "react-redux";

import Sidebar from "./components/core/Sidebar";
import { useSidebar } from "./components/core/Sidebar/hooks";
import TopNavbar from "./components/core/TopNavbar";
import { pageNames, PAGE_PATHS } from "./constants/pageNames";
import { userSelector } from "./redux/selectors/authSelector";
import { logout } from "./redux/slices/auth";
import AppRouter from "./router/AppRouter";

import "./App.css";
import {
  mainBoxSx,
  mainContainerSx,
  styledBackgroundSx,
  pagePaddingSx,
  sidebarContainerSx,
} from "./utils/layout/styles";

function App() {
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const { open, toggleSidebar } = useSidebar();

  const location = useLocation();
  const isSchedulePage = location.pathname === PAGE_PATHS.SCHEDULE;
  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.startsWith(PAGE_PATHS.PATIENTS + "/") ? "Профіль пацієнта" : "");

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} gutter={8} />
      <Box sx={mainBoxSx}>
        {user && (
          <Box sx={sidebarContainerSx(open)}>
            <Sidebar open={open} toggleSidebar={toggleSidebar} />
          </Box>
        )}

        <Box sx={mainContainerSx}>
          {user && <TopNavbar pageName={pageName} user={user} onLogout={handleLogout} />}

          <Box sx={styledBackgroundSx(isSchedulePage)}>
            <Box sx={pagePaddingSx(user)}>
              <AppRouter user={user} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
