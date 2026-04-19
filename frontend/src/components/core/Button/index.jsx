import MuiButton from "@mui/material/Button";

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
    sx: {
      backgroundColor: "#fff",
      borderColor: "primary.main",
      color: "primary.main",
      "&:hover": {
        backgroundColor: "rgba(25, 118, 210, 0.04)",
        borderColor: "primary.main",
      },
    },
  },
  [BUTTON_MODES.ERROR]: {
    variant: "outlined",
    color: "error",
    sx: {
      backgroundColor: "#fff",
      borderColor: "error.main",
      color: "error.main",
      "&:hover": {
        backgroundColor: "rgba(211, 47, 47, 0.04)",
        borderColor: "error.main",
      },
    },
  },
  [BUTTON_MODES.ERROR_FILLED]: {
    variant: "contained",
    color: "error",
    sx: {
      color: "#fff",
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
