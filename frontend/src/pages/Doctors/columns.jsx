import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const getDoctorsColumns = ({ onEdit, onDelete }) => [
  { key: "name", label: "Name", width: 180, minWidth: 150 },
  { key: "specialty", label: "Specialty", width: 160, minWidth: 140 },
  { key: "experience", label: "Experience", width: 130, minWidth: 110 },
  { key: "contact", label: "Contact", width: 200, minWidth: 180 },
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
          sx={{ "&:focus": { outline: "none" } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(row)}
          sx={{ "&:focus": { outline: "none" } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </>
    ),
  },
];
