import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0052cc",
      secondary: "#ff4081",
    },
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
