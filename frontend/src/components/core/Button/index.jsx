import MuiButton from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

const BUTTON_MODES = {
  DEFAULT: "default",
  SECONDARY: "secondary",
  ERROR: "error",
  ERROR_FILLED: "errorFilled",
};

const modeProps = {
  [BUTTON_MODES.DEFAULT]: {
    variant: "contained",
    color: "primary",
    sx: {},
  },
  [BUTTON_MODES.SECONDARY]: {
    variant: "outlined",
    color: "primary",
    sx: (theme) => ({
      backgroundColor: "background.paper",
      borderColor: "primary.main",
      color: "primary.main",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
        borderColor: "primary.main",
      },
    }),
  },
  [BUTTON_MODES.ERROR]: {
    variant: "outlined",
    color: "error",
    sx: (theme) => ({
      backgroundColor: "background.paper",
      borderColor: "error.main",
      color: "error.main",
      "&:hover": {
        backgroundColor: alpha(theme.palette.error.main, 0.06),
        borderColor: "error.main",
      },
    }),
  },
  [BUTTON_MODES.ERROR_FILLED]: {
    variant: "contained",
    color: "error",
    sx: {
      color: "common.white",
      "&:hover": {
        backgroundColor: "error.dark",
      },
    },
  },
};

function Button({ mode = BUTTON_MODES.DEFAULT, sx = {}, children, ...props }) {
  const selectedMode = modeProps[mode] || modeProps[BUTTON_MODES.DEFAULT];

  return (
    <MuiButton
      variant={selectedMode.variant}
      color={selectedMode.color}
      sx={{
        borderRadius: 999,
        padding: "4px 16px",
        minHeight: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: "24px",
        fontSize: "14px",
        fontFamily: "'Inter', 'Roboto', sans-serif",
        textTransform: "none",
        ...selectedMode.sx,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}

export { BUTTON_MODES };
export default Button;
