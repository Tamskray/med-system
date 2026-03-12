import { useState } from "react";

import TextField from "@mui/material/TextField";
import { Box, Typography, Button } from "@mui/material";

import { loginContainerSx } from "./styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { login } from "../../redux/slices/auth";

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!name || !password) return;

    try {
      await dispatch(login({ name, password })).unwrap();
      navigate("/schedule");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <Typography variant="h3">Login</Typography>
      <Box sx={loginContainerSx}>
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        )}

        <Button onClick={handleLogin} disabled={isLoading}>
          Login
        </Button>
      </Box>
    </>
  );
}

export default Login;
