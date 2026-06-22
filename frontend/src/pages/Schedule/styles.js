import {
  TOTAL_GRID_COLUMNS,
  TIMELINE_COLUMN_WIDTH,
  TIMELINE_GAP,
  TIMELINE_PADDING_X,
  LEFT_COLUMN_WIDTH,
  TIMELINE_ROW_WIDTH,
  SCHEDULE_TABLE_MIN_WIDTH,
} from "./constants";

export const pageWrapperSx = {
  minWidth: 0,
  width: "100%",
  overflowX: "hidden",
};

export const timeTitleSx = {
  mb: 2,
  fontWeight: 700,
  lineHeight: 1,
};

export const timeWeekdaySx = {
  ml: 1.5,
  fontWeight: 400,
};

export const filtersGridSx = {
  mb: 2,
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(160px, 1fr))",
    md: "repeat(3, minmax(160px, 1fr))",
    lg: "repeat(5, minmax(160px, 1fr))",
  },
  gap: 2,
  alignItems: "end",
};

export const dateSelectorSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

export const dateFieldSx = {
  flex: "0 0 auto",
  width: "170px",
};

export const getPaperSx = (isScheduleLoading) => ({
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  maxHeight: "calc(100vh - 220px)",
  borderRadius: 2,
  overflowX: isScheduleLoading ? "hidden" : "auto",
  overflowY: isScheduleLoading ? "hidden" : "auto",
});

export const getTableWrapperSx = (isScheduleLoading) => ({
  width: isScheduleLoading ? "100%" : "max-content",
  minWidth: isScheduleLoading ? 0 : SCHEDULE_TABLE_MIN_WIDTH,
});

export const tableHeaderRowSx = {
  display: "grid",
  width: SCHEDULE_TABLE_MIN_WIDTH,
  gridTemplateColumns: `${LEFT_COLUMN_WIDTH}px ${TIMELINE_ROW_WIDTH}px`,
  position: "sticky",
  top: 0,
  zIndex: 6,
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: "grey.50",
};

export const tableHeaderLabelCellSx = {
  p: 1.5,
  borderRight: "1px solid",
  borderColor: "divider",
  position: "sticky",
  left: 0,
  zIndex: 7,
  bgcolor: "grey.50",
};

export const axisHeaderGridSx = {
  display: "grid",
  gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, ${TIMELINE_COLUMN_WIDTH}px)`,
  columnGap: `${TIMELINE_GAP}px`,
  px: `${TIMELINE_PADDING_X}px`,
};

export const axisHourCellSx = {
  gridColumn: "span 4",
  p: 1,
  textAlign: "center",
  borderRight: "1px solid",
  borderColor: "divider",
  fontSize: "12px",
  fontWeight: 600,
  color: "text.secondary",
};

export const loadingBoxSx = {
  width: "100%",
  minHeight: "260px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const departmentBannerSx = {
  width: "100%",
  minWidth: SCHEDULE_TABLE_MIN_WIDTH,
  boxSizing: "border-box",
  py: 1,
  bgcolor: "primary.light",
  color: "primary.contrastText",
  borderBottom: "1px solid",
  borderColor: "divider",
};

export const departmentLabelSx = {
  position: "sticky",
  left: 0,
  zIndex: 3,
  width: "fit-content",
  px: 2,
  bgcolor: "primary.light",
};

export const doctorRowSx = {
  display: "grid",
  width: SCHEDULE_TABLE_MIN_WIDTH,
  gridTemplateColumns: `${LEFT_COLUMN_WIDTH}px ${TIMELINE_ROW_WIDTH}px`,
  borderBottom: "1px solid",
  borderColor: "divider",
};

export const doctorInfoCellSx = {
  p: 1.5,
  borderRight: "1px solid",
  borderColor: "divider",
  position: "sticky",
  left: 0,
  zIndex: 2,
  bgcolor: "common.white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 0.25,
};

export const doctorNameSx = {
  fontWeight: 600,
};

export const getTimelineBodySx = (isDoctorWorking) => ({
  ...(isDoctorWorking
    ? {
        display: "grid",
        gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, ${TIMELINE_COLUMN_WIDTH}px)`,
        columnGap: `${TIMELINE_GAP}px`,
      }
    : {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
  px: `${TIMELINE_PADDING_X}px`,
  py: 0.5,
  bgcolor: "grey.100",
  minHeight: "82px",
});

export const getSlotBoxSx = ({
  startColumn,
  span,
  occupied,
  isPast,
  canCreate,
  canUpdate,
  palette,
}) => ({
  gridColumn: `${startColumn} / span ${span}`,
  minHeight: "74px",
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  cursor:
    (occupied && canUpdate) || (!occupied && !isPast && canCreate)
      ? "pointer"
      : !occupied && isPast
        ? "not-allowed"
        : "default",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.25,
  px: 0.4,
  textAlign: "center",
  fontFamily: "Roboto, Arial, sans-serif",
  color: !occupied && isPast ? "text.disabled" : palette.text,
  backgroundColor: !occupied && isPast ? "grey.300" : palette.bg,
  opacity: !occupied && isPast ? 0.5 : 1,
  overflow: "hidden",
  transition: "background-color 120ms ease",
  "&:hover":
    !occupied && isPast
      ? { backgroundColor: "grey.50" }
      : occupied && canUpdate
        ? { backgroundColor: palette.hoverBg, color: "text.primary" }
        : !occupied && canCreate
          ? { backgroundColor: "action.hover" }
          : {},
});

export const slotPlusIconSx = {
  fontSize: "14px",
  lineHeight: 1,
  fontWeight: 700,
};

export const slotTimeSx = {
  fontSize: "10px",
  lineHeight: 1.1,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

export const slotStatusSx = {
  fontSize: "10px",
  lineHeight: 1.1,
  whiteSpace: "nowrap",
};

export const slotPatientNameSx = {
  fontSize: "9px",
  lineHeight: 1.1,
  maxWidth: "100%",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
};

export const emptyStateBoxSx = {
  p: 3,
};

export const modalFormGridSx = {
  display: "grid",
  gap: 2,
  mt: 1,
};

export const slotInfoCardSx = {
  p: 1.5,
  borderRadius: 1,
  bgcolor: "grey.100",
};

export const slotInfoDoctorNameSx = {
  fontWeight: 600,
};

export const captionBlockSx = {
  display: "block",
};

export const getCancellationReasonSx = (isCancelled) => ({
  display: isCancelled ? "block" : "none",
});
