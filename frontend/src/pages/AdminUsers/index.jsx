import { useCallback, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { getUsersColumns } from "./columns";
import CreateRoleModal from "./CreateRoleModal";
import { pageWrapperSx, toolbarSx, searchInputSx, formGridSx, submittingRowSx } from "./styles";
import Modal from "../../components/core/Modal";
import SearchInput from "../../components/core/SearchInput";
import Table from "../../components/core/Table";
import { ROLE_IDS } from "../../constants/roles";
import { useAccess } from "../../hooks/useAccess";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role_id: "",
  is_active: true,
  doctor_id: "",
};

function AdminUsers() {
  const access = useAccess("users");

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorsWithoutAccount, setDoctorsWithoutAccount] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const isDoctoRoleSelected = String(form.role_id) === String(ROLE_IDS.DOCTOR);

  const roleNameById = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role.name;
      return acc;
    }, {});
  }, [roles]);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/users`);
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result?.message || "Не вдалося завантажити користувачів");
      }

      setUsers(result.data || []);
    } catch (error) {
      showErrorToast(error.message || "Не вдалося завантажити користувачів");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/roles`);
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result?.message || "Не вдалося завантажити ролі");
      }

      setRoles(result.data || []);
    } catch (error) {
      showErrorToast(error.message || "Не вдалося завантажити ролі");
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  const loadModules = useCallback(async () => {
    setIsLoadingModules(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/modules`);
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result?.message || "Не вдалося завантажити модулі");
      }

      setModules(result.data || []);
    } catch (error) {
      showErrorToast(error.message || "Не вдалося завантажити модулі");
    } finally {
      setIsLoadingModules(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
    if (access.isSuperAdmin) {
      loadModules();
    }
  }, [loadUsers, loadRoles, loadModules, access.isSuperAdmin]);

  const handleChange = (field) => (event) => {
    const value = field === "is_active" ? event.target.checked : event.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "role_id" && String(value) !== String(ROLE_IDS.DOCTOR)) {
        next.doctor_id = "";
      }
      return next;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (!isDoctoRoleSelected) {
      setDoctorsWithoutAccount([]);
      return;
    }

    let isActive = true;
    setIsLoadingDoctors(true);
    apiFetch(`${API_BASE_URL}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) return;
        const unlinked = (data.data || []).filter((d) => !d.user_id);
        setDoctorsWithoutAccount(unlinked);
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) setIsLoadingDoctors(false);
      });

    return () => {
      isActive = false;
    };
  }, [isDoctoRoleSelected]);

  const openCreateModal = () => {
    setForm((prev) => ({ ...initialForm, role_id: prev.role_id }));
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Введіть username";
    if (!form.email.trim()) errors.email = "Введіть email";
    if (!form.password) errors.password = "Введіть пароль";
    if (!form.role_id) errors.role_id = "Оберіть роль";
    if (isDoctoRoleSelected && !form.doctor_id) errors.doctor_id = "Оберіть лікаря";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role_id: Number(form.role_id),
          is_active: form.is_active,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result?.message || "Не вдалося створити користувача");
      }

      const newUserId = result?.data?.id;

      if (isDoctoRoleSelected && form.doctor_id && newUserId) {
        await apiFetch(`${API_BASE_URL}/doctors/${form.doctor_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: newUserId }),
        });
      }

      showSuccessToast("Користувача створено");
      closeCreateModal();
      await loadUsers();
    } catch (error) {
      showErrorToast(error.message || "Не вдалося створити користувача");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => getUsersColumns(roleNameById), [roleNameById]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const search = searchTerm.toLowerCase();
    return users.filter((user) => {
      const roleName = String(roleNameById[user.role_id] || "").toLowerCase();
      const statusText = user.is_active ? "активний" : "неактивний";

      return (
        String(user.username || "")
          .toLowerCase()
          .includes(search) ||
        String(user.email || "")
          .toLowerCase()
          .includes(search) ||
        roleName.includes(search) ||
        statusText.includes(search)
      );
    });
  }, [users, searchTerm, roleNameById]);

  return (
    <Box sx={pageWrapperSx}>
      <Box sx={toolbarSx}>
        <SearchInput
          placeholder="Пошук за username, email, роллю або статусом..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={searchInputSx}
        />
        <Box sx={{ display: "flex", gap: "8px" }}>
          {access.isSuperAdmin && (
            <Button variant="outlined" onClick={() => setIsCreateRoleModalOpen(true)}>
              Створити роль
            </Button>
          )}
          {access.create && (
            <Button variant="contained" onClick={openCreateModal} disabled={isLoadingRoles}>
              Створити користувача
            </Button>
          )}
        </Box>
      </Box>

      <Table
        data={filteredUsers}
        columns={columns}
        isLoading={isLoadingUsers}
        emptyText="Користувачів ще немає"
      />

      <Modal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Створення нового користувача"
        onSubmit={handleSubmit}
        submitText="Створити"
        cancelText="Скасувати"
        submitDisabled={isSubmitting}
        width="620px"
      >
        <Box sx={formGridSx}>
          <TextField
            label="Username"
            value={form.username}
            onChange={handleChange("username")}
            size="small"
            fullWidth
            error={Boolean(formErrors.username)}
            helperText={formErrors.username || " "}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            size="small"
            fullWidth
            error={Boolean(formErrors.email)}
            helperText={formErrors.email || " "}
          />

          <TextField
            label="Пароль"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            size="small"
            fullWidth
            error={Boolean(formErrors.password)}
            helperText={formErrors.password || " "}
          />

          <FormControl fullWidth size="small" error={Boolean(formErrors.role_id)}>
            <InputLabel id="user-role-label">Роль</InputLabel>
            <Select
              labelId="user-role-label"
              value={form.role_id}
              label="Роль"
              onChange={handleChange("role_id")}
              disabled={isLoadingRoles}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={String(role.id)}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formErrors.role_id || " "}</FormHelperText>
          </FormControl>

          {isDoctoRoleSelected && (
            <FormControl fullWidth size="small" error={Boolean(formErrors.doctor_id)}>
              <InputLabel id="doctor-select-label">Лікар</InputLabel>
              <Select
                labelId="doctor-select-label"
                value={form.doctor_id}
                label="Лікар"
                onChange={handleChange("doctor_id")}
                disabled={isLoadingDoctors}
              >
                {doctorsWithoutAccount.length === 0 && !isLoadingDoctors && (
                  <MenuItem disabled value="">
                    Немає лікарів без акаунту
                  </MenuItem>
                )}
                {doctorsWithoutAccount.map((doc) => (
                  <MenuItem key={doc.id} value={String(doc.id)}>
                    {[doc.last_name, doc.first_name, doc.middle_name].filter(Boolean).join(" ")}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.doctor_id || " "}</FormHelperText>
            </FormControl>
          )}

          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={handleChange("is_active")} />}
            label="Активний"
          />

          {isSubmitting && (
            <Box sx={submittingRowSx}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Створення користувача...
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
      <CreateRoleModal
        open={isCreateRoleModalOpen}
        onClose={() => setIsCreateRoleModalOpen(false)}
        modules={modules}
        isLoadingModules={isLoadingModules}
        onRoleCreated={loadRoles}
      />
    </Box>
  );
}

export default AdminUsers;
