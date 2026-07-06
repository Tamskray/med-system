import { useState, useEffect, useMemo, Fragment } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Modal from "../../../components/core/Modal";
import { apiFetch } from "../../../utils/api";
import { API_BASE_URL } from "../../../utils/config";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

const ACTIONS = ["create", "read", "update", "delete"];
const ACTION_LABELS = {
  create: "Створення",
  read: "Читання",
  update: "Редагування",
  delete: "Видалення",
};

// Display labels for module DB names
const MODULE_LABELS = {
  appointments: "Записи на прийом",
  doctor_schedule: "Розклад лікарів",
  doctors: "Лікарі",
  medical_records: "Медичні записи",
  patients: "Пацієнти",
  users: "Користувачі",
};

// Visual groups for the permissions table
const MODULE_GROUPS = [
  { label: "Пацієнти та прийоми", names: ["patients", "appointments", "medical_records"] },
  { label: "Лікарі", names: ["doctors", "doctor_schedule"] },
  { label: "Адміністрування", names: ["users"] },
];

const buildInitialPermissions = (modules) =>
  modules.reduce((acc, mod) => {
    acc[mod.id] = { create: false, read: false, update: false, delete: false };
    return acc;
  }, {});

function CreateRoleModal({ open, onClose, modules, isLoadingModules, onRoleCreated }) {
  const [roleName, setRoleName] = useState("");
  const [nameError, setNameError] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRoleName("");
      setNameError("");
      setPermissions(buildInitialPermissions(modules));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPermissions(buildInitialPermissions(modules));
  }, [modules]);

  // Build grouped module lists, unknown modules fall into "Інше"
  const groupedModules = useMemo(() => {
    const byName = Object.fromEntries(modules.map((m) => [m.name, m]));
    const seen = new Set();
    const result = [];

    for (const group of MODULE_GROUPS) {
      const mods = group.names.map((n) => byName[n]).filter(Boolean);
      if (mods.length > 0) {
        result.push({ label: group.label, mods });
        mods.forEach((m) => seen.add(m.id));
      }
    }

    const unknown = modules.filter((m) => !seen.has(m.id));
    if (unknown.length > 0) {
      result.push({ label: "Інше", mods: unknown });
    }

    return result;
  }, [modules]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const togglePermission = (moduleId, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action],
      },
    }));
  };

  const toggleAllForAction = (action) => {
    const allChecked = modules.every((mod) => permissions[mod.id]?.[action]);
    setPermissions((prev) => {
      const next = { ...prev };
      modules.forEach((mod) => {
        next[mod.id] = { ...next[mod.id], [action]: !allChecked };
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      setNameError("Введіть назву ролі");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName.trim(), permissions }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result?.message || "Не вдалося створити роль");
      }

      showSuccessToast("Роль створено");
      onRoleCreated();
      onClose();
    } catch (error) {
      showErrorToast(error.message || "Не вдалося створити роль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Створення нової ролі"
      onSubmit={handleSubmit}
      submitText="Створити"
      cancelText="Скасувати"
      submitDisabled={isSubmitting}
      width="720px"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <TextField
          label="Назва ролі"
          value={roleName}
          onChange={(e) => {
            setRoleName(e.target.value);
            if (nameError) setNameError("");
          }}
          size="small"
          fullWidth
          autoFocus
          error={Boolean(nameError)}
          helperText={nameError || " "}
        />

        {isLoadingModules ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : modules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Модулі не знайдені
          </Typography>
        ) : (
          <MuiTable size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: "40%" }}>Модуль</TableCell>
                {ACTIONS.map((action) => (
                  <TableCell key={action} align="center" sx={{ fontWeight: 600 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0,
                      }}
                    >
                      <span>{ACTION_LABELS[action]}</span>
                      <Checkbox
                        size="small"
                        title={`Вибрати всі: ${ACTION_LABELS[action]}`}
                        checked={
                          modules.length > 0 &&
                          modules.every((mod) => permissions[mod.id]?.[action])
                        }
                        indeterminate={
                          modules.some((mod) => permissions[mod.id]?.[action]) &&
                          !modules.every((mod) => permissions[mod.id]?.[action])
                        }
                        onChange={() => toggleAllForAction(action)}
                      />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedModules.map((group) => (
                <Fragment key={group.label}>
                  <TableRow key={`group-${group.label}`}>
                    <TableCell
                      colSpan={5}
                      sx={{
                        bgcolor: "grey.100",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        py: 0.75,
                        px: 2,
                        borderBottom: "none",
                      }}
                    >
                      {group.label}
                    </TableCell>
                  </TableRow>
                  {group.mods.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell sx={{ pl: 3 }}>{MODULE_LABELS[mod.name] ?? mod.name}</TableCell>
                      {ACTIONS.map((action) => (
                        <TableCell key={action} align="center">
                          <Checkbox
                            size="small"
                            checked={Boolean(permissions[mod.id]?.[action])}
                            onChange={() => togglePermission(mod.id, action)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </MuiTable>
        )}

        {isSubmitting && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Створення ролі...
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default CreateRoleModal;
