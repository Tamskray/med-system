import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Link as RouterLink } from "react-router";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toggleDevMode } from "../../../redux/slices/devMode";

export default function Sidebar({ open, toggleSidebar }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const devModeEnabled = useSelector((state) => state.devMode.enabled);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const isSuperAdmin = user?.is_super_admin === true;

  const navItems = [
    { path: "/schedule", label: "Розклад", icon: ScheduleIcon },
    { path: "/doctor-dashboard", label: "Розклад лікаря", icon: EventNoteIcon },
    { path: "/doctors", label: "Лікарі", icon: LocalHospitalIcon },
    { path: "/patients", label: "Пацієнти", icon: PeopleIcon },
    ...(isAdmin ? [{ path: "/admin/users", label: "Користувачі", icon: ManageAccountsIcon }] : []),
  ];

  return (
    <Box
      sx={{
        position: "relative",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: open ? "flex-start" : "center",
        overflow: "hidden",
        height: "100%",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          top: -90,
          right: open ? -70 : -100,
          background:
            "radial-gradient(circle at 30% 30%, rgba(33, 150, 243, 0.28), rgba(33, 150, 243, 0))",
          pointerEvents: "none",
          zIndex: 0,
          transition: "right 0.3s ease",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          bottom: -80,
          left: open ? -70 : -100,
          background:
            "radial-gradient(circle at 65% 65%, rgba(0, 150, 136, 0.24), rgba(0, 150, 136, 0))",
          pointerEvents: "none",
          zIndex: 0,
          transition: "left 0.3s ease",
        },
      }}
    >
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: "absolute",
          top: 10,
          left: open ? 10 : "50%",
          transform: open ? "none" : "translateX(-50%)",
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          width: 34,
          height: 34,
          zIndex: 1,
          "&:focus": { outline: "none" },
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 8,
          paddingX: open ? 2 : 0,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Box
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: open ? "8px 12px" : "8px",
                borderRadius: 1,
                textDecoration: "none",
                color: isActive ? "primary.main" : "text.secondary",
                backgroundColor: isActive ? "action.selected" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "primary.light" : "transparent",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: isActive ? "action.selected" : "action.hover",
                  color: "primary.main",
                },
                justifyContent: open ? "flex-start" : "center",
                fontWeight: isActive ? 600 : 500,
                fontFamily: "Roboto, sans-serif",
              }}
            >
              <Icon />
              {open && <span>{item.label}</span>}
            </Box>
          );
        })}
        {isSuperAdmin && (
          <Chip
            label={devModeEnabled ? "DEV MODE ON" : "DEV MODE OFF"}
            onClick={() => dispatch(toggleDevMode())}
            color={devModeEnabled ? "warning" : "default"}
            variant="outlined"
            size="small"
            sx={{
              marginTop: "auto",
              alignSelf: open ? "flex-start" : "center",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
