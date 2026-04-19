import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0052cc",
    },
    secondary: {
      main: "#ff4081",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    table: {
      zebra: "#f7fbff",
      hover: "#eaeef3",
      header: "#e6f1ff",
    },
    divider: "#dbe1ea",
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          "&.Mui-focusVisible": {
            outline: "none",
          },
          ":focus": {
            outline: "none",
          },
        },
      },
    },
  },
});
