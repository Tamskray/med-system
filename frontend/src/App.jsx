import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Link } from "react-router";

import AppRouter from "./router/AppRouter";

import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "./redux/selectors/authSelector";
import { logout } from "./redux/slices/auth";

const Navigation = () => (
  <Box sx={{ display: "flex", justifyContent: "center", gap: 2, my: 4 }}>
    <Link to="/schedule">Schedule</Link>
    <Link to="/doctors">Doctors</Link>
    <Link to="/patients">Patients</Link>
  </Box>
);

function App() {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <Typography variant="h3">MED System</Typography>

      {user && <Navigation />}

      {user && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Welcome, {user.name}
          </Typography>
          <Button sx={{ backgroundColor: "primary.secondary" }} onClick={handleLogout}>
            Sign Out
          </Button>
        </Box>
      )}

      <AppRouter user={user} />
    </>
  );
}

export default App;
