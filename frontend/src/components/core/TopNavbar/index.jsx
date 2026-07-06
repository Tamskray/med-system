import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button, { BUTTON_MODES } from "../Button";

export default function TopNavbar({ pageName, user, onLogout }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingX: 3,
        paddingY: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 150,
          height: 150,
          borderRadius: "50%",
          top: -105,
          right: -25,
          background:
            "radial-gradient(circle at 35% 35%, rgba(33, 150, 243, 0.12), rgba(33, 150, 243, 0))",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: "50%",
          top: -70,
          left: 130,
          background:
            "radial-gradient(circle at 65% 65%, rgba(0, 150, 136, 0.08), rgba(0, 150, 136, 0))",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Typography variant="h6" sx={{ position: "relative", zIndex: 1 }}>
        {pageName}
      </Typography>

      {user && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Вітаємо, {user.username || user.name}
          </Typography>
          <Button mode={BUTTON_MODES.SECONDARY} size="small" onClick={onLogout}>
            Вийти
          </Button>
        </Box>
      )}
    </Box>
  );
}
