export const getUsersColumns = (roleNameById) => [
  {
    key: "username",
    label: "Username",
    minWidth: 180,
  },
  {
    key: "email",
    label: "Email",
    minWidth: 220,
  },
  {
    key: "role_id",
    label: "Роль",
    minWidth: 150,
    render: (row) => roleNameById[row.role_id] || `ID ${row.role_id}`,
  },
  {
    key: "is_active",
    label: "Статус",
    minWidth: 120,
    render: (row) => (row.is_active ? "Активний" : "Неактивний"),
  },
  {
    key: "created_at",
    label: "Створено",
    minWidth: 160,
    render: (row) => {
      if (!row.created_at) return "-";
      const date = new Date(row.created_at);
      if (Number.isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("uk-UA");
    },
  },
];
