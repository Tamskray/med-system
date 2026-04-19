import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const getDoctorsColumns = ({ onEdit, onDelete }) => [
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
    render: (row) => row.room_number || "—",
  },
  {
    key: "is_active",
    label: "Статус",
    width: 130,
    minWidth: 100,
    render: (row) =>
      row.is_active ? (
        <Chip label="Активний" size="small" color="success" variant="outlined" />
      ) : (
        <Chip label="Неактивний" size="small" color="default" variant="outlined" />
      ),
  },
  {
    key: "actions",
    label: "Actions",
    width: 100,
    minWidth: 80,
    maxWidth: 100,
    sortable: false,
    render: (row) => (
      <>
        <IconButton
          size="small"
          onClick={() => onEdit(row)}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            "&:focus": { outline: "none" },
            "&:hover": {
              backgroundColor: theme.palette.table.header,
              color: theme.palette.primary.main,
            },
          })}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(row)}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            "&:focus": { outline: "none" },
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              color: theme.palette.error.dark,
            },
          })}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </>
    ),
  },
];
