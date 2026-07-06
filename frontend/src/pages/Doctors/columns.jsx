import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";

import { doctorActionIconButtonSx, doctorDeleteIconButtonSx } from "./styles";
import Tooltip from "../../components/core/Tooltip";

export const getDoctorsColumns = ({
  onOpenWorkingHours,
  onOpenTimeOff,
  onEdit,
  onDelete,
  onToggleActive,
  togglingDoctorIds = {},
  canUpdate = false,
  canDelete = false,
}) => {
  const columns = [
    {
      key: "full_name",
      label: "ПІБ",
      width: 240,
      minWidth: 180,
      render: (row) =>
        [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(" ") || "—",
    },
    {
      key: "department_name",
      label: "Відділення",
      width: 200,
      minWidth: 150,
      render: (row) => row.department_name ?? "—",
    },
    {
      key: "room_number",
      label: "Кабінет",
      width: 110,
      minWidth: 90,
      render: (row) => <Chip label={row.room_number || "—"} size="small" variant="outlined" />,
    },
    {
      key: "is_active",
      label: "Статус",
      width: 180,
      minWidth: 150,
      render: (row) => (
        <>
          {canUpdate && (
            <Switch
              size="small"
              checked={Boolean(row.is_active)}
              disabled={Boolean(togglingDoctorIds[row.id])}
              onChange={(event) => onToggleActive(row, event.target.checked)}
              inputProps={{ "aria-label": "Doctor active status" }}
            />
          )}
          {row.is_active ? (
            <Chip label="Активний" size="small" color="success" variant="outlined" />
          ) : (
            <Chip label="Неактивний" size="small" color="default" variant="outlined" />
          )}
        </>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      key: "actions",
      label: "Дії",
      width: 180,
      minWidth: 160,
      maxWidth: 180,
      sortable: false,
      render: (row) => (
        <>
          <Tooltip title="Переглянути графік">
            <IconButton
              size="small"
              onClick={() => onOpenWorkingHours(row)}
              sx={doctorActionIconButtonSx}
            >
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Додати вихідний">
              <IconButton
                size="small"
                onClick={() => onOpenTimeOff(row)}
                sx={doctorActionIconButtonSx}
              >
                <EventBusyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip title="Редагувати лікаря">
              <IconButton size="small" onClick={() => onEdit(row)} sx={doctorActionIconButtonSx}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Видалити лікаря">
              <IconButton size="small" onClick={() => onDelete(row)} sx={doctorDeleteIconButtonSx}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    });
  }

  return columns;
};
