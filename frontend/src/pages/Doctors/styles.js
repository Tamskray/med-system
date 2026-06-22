export const doctorActionIconButtonSx = (theme) => ({
  color: theme.palette.text.secondary,
  "&:focus": { outline: "none" },
  "&:hover": {
    backgroundColor: theme.palette.table.header,
    color: theme.palette.primary.main,
  },
});

export const doctorDeleteIconButtonSx = (theme) => ({
  color: theme.palette.text.secondary,
  "&:focus": { outline: "none" },
  "&:hover": {
    backgroundColor: "rgba(211, 47, 47, 0.08)",
    color: theme.palette.error.dark,
  },
});

export const workingHoursDrawerPaperSx = {
  width: { xs: "100%", sm: 380 },
};

export const workingHoursDrawerHeaderBoxSx = {
  p: 2,
};

export const workingHoursDrawerLoadingBoxSx = {
  p: 3,
  display: "flex",
  justifyContent: "center",
};

export const workingHoursDrawerListSx = {
  px: 1,
  py: 0.5,
};

export const doctorsPageHeaderBoxSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 2,
};

export const doctorsPageSearchInputSx = {
  flex: 1,
  minWidth: 280,
  maxWidth: 520,
};

export const doctorsPageFiltersBoxSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  marginBottom: 2,
};

export const doctorsPageDepartmentFormControlSx = {
  minWidth: 220,
};

export const doctorsPageStatusFormControlSx = {
  minWidth: 160,
};
