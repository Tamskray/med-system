import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import Tooltip from "../../components/core/Tooltip";

const GENDER_LABELS = {
  male: "Чоловіча",
  female: "Жіноча",
  other: "Інша",
};

const getGenderIcon = (gender) => {
  if (gender === "male") return <PersonOutlineIcon fontSize="small" sx={{ color: "info.main" }} />;
  if (gender === "female") {
    return <PersonOutlineIcon fontSize="small" sx={{ color: "#ec4899" }} />;
  }
  if (gender === "other")
    return <PersonOutlineIcon fontSize="small" sx={{ color: "success.main" }} />;
  return null;
};

export const getPatientsColumns = ({ onEdit, onDelete, canUpdate, canDelete }) => {
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
      key: "date_of_birth",
      label: "Дата народження",
      width: 160,
      minWidth: 130,
      render: (row) =>
        row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString("uk-UA") : "—",
    },
    {
      key: "gender",
      label: "Стать",
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      render: (row) => {
        const label = GENDER_LABELS[row.gender] || row.gender || "—";
        const icon = getGenderIcon(row.gender);

        if (!icon) return label;

        return (
          <Tooltip title={label} arrow>
            <Box sx={{ display: "inline-flex", alignItems: "center", lineHeight: 0 }}>{icon}</Box>
          </Tooltip>
        );
      },
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
      label: "Пошта",
      width: 220,
      minWidth: 160,
      render: (row) => row.email || "—",
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      key: "actions",
      label: "Дії",
      width: 100,
      minWidth: 80,
      maxWidth: 100,
      sortable: false,
      render: (row) => (
        <>
          {canUpdate && (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
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
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
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
          )}
        </>
      ),
    });
  }

  return columns;
};
