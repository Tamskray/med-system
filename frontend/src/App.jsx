import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Link } from "react-router";
import { useState } from "react";

import AppRouter from "./router/AppRouter";

import "./App.css";

const Navigation = () => (
  <Box sx={{ display: "flex", justifyContent: "center", gap: 2, my: 4 }}>
    <Link to="/">Landing</Link>
    <Link to="/doctors">Doctors</Link>
    <Link to="/patients">Patients</Link>
  </Box>
);

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = () =>
    setUser({ id: "1", name: "robin", role: "admin", permissions: ["all-permissions"] });
  const handleLogout = () => setUser(null);

  return (
    <>
      <Typography variant="h3">Vite + React</Typography>
      <Button sx={{ backgroundColor: "primary.secondary" }} variant="contained">
        Hello World
      </Button>

      <Navigation />

      {user ? (
        <Button onClick={handleLogout}>Sign Out</Button>
      ) : (
        <Button onClick={handleLogin}>Sign In</Button>
      )}

      <AppRouter user={user} />
    </>
  );
}

export default App;
