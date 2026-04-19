import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { Link as RouterLink } from "react-router";
import { useLocation } from "react-router";

const navItems = [
  { path: "/schedule", label: "Schedule", icon: ScheduleIcon },
  { path: "/doctors", label: "Doctors", icon: LocalHospitalIcon },
  { path: "/patients", label: "Patients", icon: PeopleIcon },
];

export default function Sidebar({ open, toggleSidebar }) {
  const location = useLocation();

  return (
    <Box
      sx={{
        position: "relative",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: open ? "flex-start" : "center",
        overflow: "hidden",
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
          "&:focus": { outline: "none" },
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 8,
          paddingX: open ? 2 : 0,
          width: "100%",
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
      </Box>
    </Box>
  );
}
