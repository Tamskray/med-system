export const pageWrapperSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 10,
};

export const topSectionPaperSx = {
  p: 2.5,
};

export const topSectionBoxSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  justifyContent: "space-between",
  alignItems: "flex-start",
};

export const patientNameSx = {
  fontWeight: 700,
};

export const patientMetaSx = {
  mt: 1,
};

export const actionsColumnSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 1,
};

export const loadingPaperSx = {
  p: 4,
  display: "flex",
  justifyContent: "center",
};

export const infoPaperSx = {
  p: 2.5,
};

export const infoGridSx = {
  container: true,
  spacing: 2,
};

export const infoRowLabelSx = {
  display: "block",
};

export const historyPaperSx = {
  p: 2.5,
};

export const historyTitleSx = {
  mb: 1.5,
  fontWeight: 600,
};

export const medicalSectionGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
};

export const currentVisitRowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 1.25,
  flexWrap: "wrap",
};

export const currentVisitChipSx = {
  fontWeight: 600,
};

export const currentVisitStatusSx = {
  minWidth: 160,
  flexShrink: 0,
  ml: "auto",
};

export const historyScrollSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  height: 520,
  overflowY: "scroll",
  pr: 0.5,
};

export const historyRecordSx = {
  border: "1px solid",
  borderColor: "grey.300",
  borderRadius: 1,
};

export const historyRecordContentSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const recordDateSx = {
  display: "block",
};

export const newRecordPaperSx = {
  p: 2.5,
};

export const newRecordTitleSx = {
  mb: 1.5,
  fontWeight: 600,
};

export const newRecordFormSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const saveButtonRowSx = {
  display: "flex",
  justifyContent: "flex-end",
};

export const doctorLinkButtonSx = {
  border: 0,
  p: 0,
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "inherit",
  fontFamily: "inherit",
  color: "inherit",
  "&:hover": {
    color: "primary.main",
  },
};

export const getStatusChipStyles = (status) => {
  const normalizedStatus = String(status || "").trim();

  if (normalizedStatus === "Scheduled" || normalizedStatus === "Заплановано") {
    return {
      label: "Заплановано",
      sx: {
        backgroundColor: "success.light",
        color: "common.white",
        fontWeight: 500,
      },
    };
  }

  if (normalizedStatus === "Прибув") {
    return {
      label: "Прибув",
      sx: {
        backgroundColor: "warning.light",
        color: "common.white",
        fontWeight: 500,
      },
    };
  }

  if (normalizedStatus === "В процесі") {
    return {
      label: "В процесі",
      sx: {
        backgroundColor: "secondary.main",
        color: "common.white",
        fontWeight: 500,
      },
    };
  }

  if (normalizedStatus === "Completed" || normalizedStatus === "Завершено") {
    return {
      label: "Завершено",
      sx: {
        backgroundColor: "info.light",
        color: "common.white",
        fontWeight: 500,
      },
    };
  }

  if (normalizedStatus === "Cancelled" || normalizedStatus === "Скасовано") {
    return {
      label: "Скасовано",
      sx: {
        backgroundColor: "common.white",
        color: "error.main",
        border: "1px solid",
        borderColor: "error.main",
        fontWeight: 500,
      },
    };
  }

  return {
    label: normalizedStatus || "-",
    sx: {
      backgroundColor: "grey.100",
      color: "common.white",
      fontWeight: 500,
    },
  };
};
