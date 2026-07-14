import { useDoctors, getDoctorFullName } from "./useDoctors";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import DoctorsForm from "./DoctorsForm";
import {
  doctorsPageHeaderBoxSx,
  doctorsPageSearchInputSx,
  doctorsPageFiltersBoxSx,
  doctorsPageDepartmentFormControlSx,
  doctorsPageStatusFormControlSx,
} from "./styles";
import TimeOffModal from "./TimeOffModal";
import WorkingHoursDrawer from "./WorkingHoursDrawer";
import Button from "../../components/core/Button";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import SearchInput from "../../components/core/SearchInput";
import Table from "../../components/core/Table";

import {
  DOCTOR_FORM_MODES,
  DOCTOR_STATUS_OPTIONS,
  DOCTOR_DEPARTMENT_ALL_OPTION,
} from "./constants";

function Doctors() {
  const {
    access,
    searchTerm,
    filterDepartmentId,
    filterStatus,
    departmentOptions,
    isLoading,
    filteredDoctors,
    columns,
    isFormModalOpen,
    formMode,
    selectedDoctor,
    isDeleteModalOpen,
    deleteTarget,
    isHoursDrawerOpen,
    hoursDoctor,
    workingHoursByDay,
    isWorkingHoursLoading,
    isTimeOffModalOpen,
    timeOffDoctor,
    setSearchTerm,
    setFilterDepartmentId,
    setFilterStatus,
    openCreateModal,
    handleCloseFormModal,
    handleDoctorSubmit,
    handleCancelDelete,
    handleConfirmDelete,
    handleCloseWorkingHoursDrawer,
    handleCloseTimeOffModal,
  } = useDoctors();

  return (
    <Box>
      <Box sx={doctorsPageHeaderBoxSx}>
        <SearchInput
          placeholder="Пошук за прізвищем, іменем або кабінетом..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={doctorsPageSearchInputSx}
        />
        {access.create && (
          <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
            Додати лікаря
          </Button>
        )}
      </Box>

      <Box sx={doctorsPageFiltersBoxSx}>
        <FormControl size="small" sx={doctorsPageDepartmentFormControlSx}>
          <Select
            displayEmpty
            value={filterDepartmentId}
            onChange={(e) => setFilterDepartmentId(e.target.value)}
            renderValue={(value) =>
              departmentOptions.find((option) => option.value === value)?.label ??
              DOCTOR_DEPARTMENT_ALL_OPTION.label
            }
          >
            {departmentOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={doctorsPageStatusFormControlSx}>
          <Select
            displayEmpty
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            renderValue={(value) =>
              DOCTOR_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? "Усі статуси"
            }
          >
            {DOCTOR_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || "all"} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table data={filteredDoctors} columns={columns} isLoading={isLoading} />

      {isFormModalOpen && (
        <DoctorsForm
          key={`${formMode}-${selectedDoctor?.id ?? "new"}`}
          open={isFormModalOpen}
          mode={formMode}
          initialValues={selectedDoctor}
          isLoading={isLoading}
          onClose={handleCloseFormModal}
          onSubmit={handleDoctorSubmit}
        />
      )}

      {isTimeOffModalOpen && (
        <TimeOffModal
          open={isTimeOffModalOpen}
          onClose={handleCloseTimeOffModal}
          doctorId={timeOffDoctor?.id}
          doctorName={timeOffDoctor?.name}
        />
      )}

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={[deleteTarget?.last_name, deleteTarget?.first_name].filter(Boolean).join(" ")}
        itemLabel="doctor"
        isLoading={isLoading}
      />

      <WorkingHoursDrawer
        open={isHoursDrawerOpen}
        onClose={handleCloseWorkingHoursDrawer}
        doctorName={getDoctorFullName(hoursDoctor)}
        workingHoursByDay={workingHoursByDay}
        isLoading={isWorkingHoursLoading}
      />
    </Box>
  );
}

export default Doctors;
