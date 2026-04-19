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
      }}
    >
      <Typography variant="h6">{pageName}</Typography>

      {user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Welcome, {user.name}
          </Typography>
          <Button mode={BUTTON_MODES.SECONDARY} size="small" onClick={onLogout}>
            Sign Out
          </Button>
        </Box>
      )}
    </Box>
  );
}
