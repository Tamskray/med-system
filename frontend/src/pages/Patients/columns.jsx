import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const getPatientsColumns = ({ onEdit, onDelete }) => [
  {
    key: "full_name",
    label: "ПІБ",
    width: 240,
    minWidth: 180,
    render: (row) =>
      [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(" ") || "—",
  },
  {
    key: "date_of_birth",
    label: "Дата народження",
    width: 160,
    minWidth: 130,
    render: (row) =>
      row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString("uk-UA") : "—",
  },
  {
    key: "phone",
    label: "Телефон",
    width: 160,
    minWidth: 130,
    render: (row) => row.phone || "—",
  },
  {
    key: "email",
    label: "Email",
    width: 220,
    minWidth: 160,
    render: (row) => row.email || "—",
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
