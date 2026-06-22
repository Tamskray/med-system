import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Tooltip from "../../components/core/Tooltip";

export const getAppointmentHistoryColumns = ({
  navigate,
  getDoctorFullName,
  formatDate,
  formatTime,
  doctorLinkButtonSx,
  getStatusChipStyles,
}) => [
  {
    key: "start_time",
    label: "Дата",
    minWidth: 140,
    render: (row) => formatDate(row.appointment_date || row.start_time),
  },
  {
    key: "time",
    label: "Час",
    minWidth: 140,
    sortable: false,
    render: (row) => `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`,
  },
  {
    key: "doctor",
    label: "Лікар",
    minWidth: 180,
    sortable: false,
    render: (row) => {
      const doctorName = getDoctorFullName(row.doctors);
      const doctorId = row?.doctors?.id;

      if (!doctorId) {
        return doctorName;
      }

      return (
        <Typography
          component="button"
          onClick={() =>
            navigate(
              `/doctors?search=${encodeURIComponent(doctorName)}&doctorId=${encodeURIComponent(doctorId)}`,
            )
          }
          sx={doctorLinkButtonSx}
        >
          {doctorName}
        </Typography>
      );
    },
  },
  {
    key: "status",
    label: "Статус",
    minWidth: 130,
    sortable: false,
    render: (row) => {
      const statusChip = getStatusChipStyles(row.status);
      const normalizedStatus = String(row.status || "").trim();
      const isCancelled = normalizedStatus === "Cancelled" || normalizedStatus === "Скасовано";
      const isScheduled = normalizedStatus === "Scheduled" || normalizedStatus === "Заплановано";
      const tooltipText = isCancelled ? row.cancellation_reason : isScheduled ? row.notes : "";

      const chip = <Chip size="small" label={statusChip.label} sx={statusChip.sx} />;

      if (!tooltipText) {
        return chip;
      }

      return (
        <Tooltip title={tooltipText} arrow>
          <Box component="span">{chip}</Box>
        </Tooltip>
      );
    },
  },
  {
    key: "appointment_type",
    label: "Тип",
    minWidth: 180,
    sortable: false,
    render: (row) => row.appointment_type || "-",
  },
];
