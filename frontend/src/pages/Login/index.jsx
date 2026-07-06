import { useState } from "react";
import { useNavigate } from "react-router";

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box, Typography, Button, Divider } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import { useDispatch, useSelector } from "react-redux";

import {
  loginPageSx,
  loginShapesSx,
  loginCardSx,
  loginTitleSx,
  loginHospitalIconSx,
  autofillSx,
  submitButtonSx,
} from "./styles";
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box sx={loginPageSx}>
      {loginShapesSx.map((sx, i) => (
        <Box key={i} sx={sx} />
      ))}

      <Box sx={loginCardSx}>
        <Typography variant="h6" sx={loginTitleSx}>
          <LocalHospitalIcon sx={loginHospitalIconSx} />
          <Box>Вхід до системи</Box>
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <TextField
          label="Ім'я користувача або Email"
          variant="outlined"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="username"
          sx={autofillSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Пароль"
          variant="outlined"
          type="password"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
          sx={autofillSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          onClick={handleLogin}
          disabled={isLoading || !name || !password}
          fullWidth
          size="large"
          sx={submitButtonSx}
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : "Увійти"}
        </Button>

        <Typography variant="caption" color="text.secondary" align="center">
          Доступ лише для авторизованого персоналу
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
