import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function TopNavbar({ pageName, user, onLogout }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingX: 3,
        paddingY: 2,
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="h6">{pageName}</Typography>

      {user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">Welcome, {user.name}</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={onLogout}
            sx={{ backgroundColor: "primary.secondary" }}
          >
            Sign Out
          </Button>
        </Box>
      )}
    </Box>
  );
}
