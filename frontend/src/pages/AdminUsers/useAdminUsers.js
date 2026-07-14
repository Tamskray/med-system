import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccess } from "../../hooks/useAccess";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { getUsersColumns } from "./columns";
import { ROLE_IDS } from "../../constants/roles";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role_id: "",
  is_active: true,
  doctor_id: "",
};

export const useAdminUsers = () => {
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
      showErrorToast(error?.message || "Не вдалося завантажити користувачів");
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
      showErrorToast(error?.message || "Не вдалося завантажити ролі");
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
      showErrorToast(error?.message || "Не вдалося завантажити модулі");
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
      showErrorToast(error?.message || "Не вдалося створити користувача");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleNameById = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role.name;
      return acc;
    }, {});
  }, [roles]);

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

  return {
    access,
    users,
    filteredUsers,
    searchTerm,
    isLoadingUsers,
    roles,
    isLoadingRoles,
    roleNameById,
    modules,
    isLoadingModules,
    form,
    formErrors,
    isSubmitting,
    isDoctoRoleSelected,
    isCreateModalOpen,
    isCreateRoleModalOpen,
    doctorsWithoutAccount,
    isLoadingDoctors,
    columns,
    setSearchTerm,
    setIsCreateRoleModalOpen,
    handleChange,
    openCreateModal,
    closeCreateModal,
    handleSubmit,
    loadRoles,
  };
};
