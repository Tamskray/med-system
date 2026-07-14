import { useAdminUsers } from "./useAdminUsers";

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

import CreateRoleModal from "./CreateRoleModal";
import { pageWrapperSx, toolbarSx, searchInputSx, formGridSx, submittingRowSx } from "./styles";
import Modal from "../../components/core/Modal";
import SearchInput from "../../components/core/SearchInput";
import Table from "../../components/core/Table";

function AdminUsers() {
  const {
    access,
    filteredUsers,
    searchTerm,
    isLoadingUsers,
    roles,
    isLoadingRoles,
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
  } = useAdminUsers();

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
