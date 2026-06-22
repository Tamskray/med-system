export const loginPageSx = {
  position: "relative",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  backgroundColor: "background.default",

  "&::before": {
    content: '""',
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: "50%",
    top: -160,
    left: -140,
    background:
      "radial-gradient(circle at 35% 35%, rgba(33, 150, 243, 0.22), rgba(33, 150, 243, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },

  "&::after": {
    content: '""',
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: "50%",
    bottom: -140,
    right: -120,
    background: "radial-gradient(circle at 65% 65%, rgba(0, 150, 136, 0.2), rgba(0, 150, 136, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },
};

export const loginShapesSx = [
  {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    top: -60,
    right: 60,
    background: "radial-gradient(circle at 40% 40%, rgba(0, 150, 136, 0.15), rgba(0, 150, 136, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },

  {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: "50%",
    bottom: -80,
    left: 40,
    background:
      "radial-gradient(circle at 55% 55%, rgba(33, 150, 243, 0.16), rgba(33, 150, 243, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },

  {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: "50%",
    top: "45%",
    right: 30,
    background: "radial-gradient(circle at 50% 50%, rgba(0, 150, 136, 0.1), rgba(0, 150, 136, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },
];

export const loginTitleSx = {
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const loginHospitalIconSx = {
  color: "primary.main",
  fontSize: 32,
};

export const autofillSx = {
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px #ffffff inset",
    WebkitTextFillColor: "#0f172a",
  },
};

export const submitButtonSx = { mt: 0.5 };

export const loginCardSx = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: 400,
  padding: "36px 32px",
  borderRadius: "16px",
  backgroundColor: "background.paper",
  boxShadow: "0 8px 32px rgba(0, 82, 204, 0.10), 0 1.5px 6px rgba(0,0,0,0.06)",
  border: "1px solid",
  borderColor: "divider",
};
