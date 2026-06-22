import { useState, useMemo, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { showErrorToast } from "../../utils/toast";
import Button from "../../components/core/Button";
import Table from "../../components/core/Table";
import SearchInput from "../../components/core/SearchInput";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import { apiFetch } from "../../utils/api";
import DoctorsForm from "./DoctorsForm";
import TimeOffModal from "./TimeOffModal";
import WorkingHoursDrawer from "./WorkingHoursDrawer";
import { getDoctorsColumns } from "./columns.jsx";
import {
  DOCTOR_FORM_MODES,
  DOCTOR_STATUS_OPTIONS,
  DOCTOR_DEPARTMENT_ALL_OPTION,
  WEEK_DAYS,
} from "./constants";
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../redux/slices/doctors";
import { useAccess } from "../../hooks/useAccess";
import { API_BASE_URL } from "../../utils/config";
import {
  doctorsPageHeaderBoxSx,
  doctorsPageSearchInputSx,
  doctorsPageFiltersBoxSx,
  doctorsPageDepartmentFormControlSx,
  doctorsPageStatusFormControlSx,
} from "./styles";
const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ") || "Лікар";
function Doctors() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const doctorIdFromQuery = searchParams.get("doctorId");
  const { doctors, isLoading } = useSelector((state) => state.doctors);
  const access = useAccess("doctors");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState(DOCTOR_DEPARTMENT_ALL_OPTION.value);
  const [filterStatus, setFilterStatus] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(DOCTOR_FORM_MODES.CREATE);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingDoctorIds, setTogglingDoctorIds] = useState({});
  const [isHoursDrawerOpen, setIsHoursDrawerOpen] = useState(false);
  const [hoursDoctor, setHoursDoctor] = useState(null);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [timeOffDoctor, setTimeOffDoctor] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [isWorkingHoursLoading, setIsWorkingHoursLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    const searchFromQuery = searchParams.get("search");
    if (searchFromQuery) {
      setSearchTerm(searchFromQuery);
    }
  }, [searchParams]);

  const departments = useMemo(() => {
    if (!doctors) return [];
    const seen = new Set();
    return doctors
      .filter((d) => d.department_id && d.department_name)
      .reduce((acc, d) => {
        if (!seen.has(d.department_id)) {
          seen.add(d.department_id);
          acc.push({ id: d.department_id, name: d.department_name });
        }
        return acc;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [doctors]);

  const departmentOptions = useMemo(
    () => [
      DOCTOR_DEPARTMENT_ALL_OPTION,
      ...departments.map((department) => ({
        value: String(department.id),
        label: department.name,
      })),
    ],
    [departments],
  );

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];

    return doctors.filter((doctor) => {
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const fullName =
          [doctor.last_name, doctor.first_name, doctor.middle_name]
            .filter(Boolean)
            .join(" ")
            .toLowerCase() || "";
        const searchTokens = search.split(/\s+/).filter(Boolean);
        const matchesFullNameTokens = searchTokens.every((token) => fullName.includes(token));
        const matchesDoctorIdFromQuery =
          Boolean(doctorIdFromQuery) && String(doctor.id) === String(doctorIdFromQuery);
        const matchesSearch =
          fullName.includes(search) ||
          matchesFullNameTokens ||
          doctor.last_name?.toLowerCase().includes(search) ||
          doctor.first_name?.toLowerCase().includes(search) ||
          doctor.room_number?.toLowerCase().includes(search) ||
          String(doctor.id || "").includes(search);

        if (!matchesSearch && !matchesDoctorIdFromQuery) return false;
      }

      if (
        filterDepartmentId !== DOCTOR_DEPARTMENT_ALL_OPTION.value &&
        String(doctor.department_id) !== String(filterDepartmentId)
      ) {
        return false;
      }

      if (filterStatus !== "") {
        const isActive = filterStatus === "active";
        if (doctor.is_active !== isActive) return false;
      }

      return true;
    });
  }, [searchTerm, filterDepartmentId, filterStatus, doctors, doctorIdFromQuery]);

  const openCreateModal = () => {
    setFormMode(DOCTOR_FORM_MODES.CREATE);
    setSelectedDoctor(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setFormMode(DOCTOR_FORM_MODES.EDIT);
    setSelectedDoctor(doctor);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleDoctorSubmit = async (doctorData) => {
    if (isLoading) return;

    try {
      const { workingHours, ...doctorPayload } = doctorData;
      let doctorId;

      if (formMode === DOCTOR_FORM_MODES.EDIT) {
        const result = await dispatch(
          updateDoctor({ id: doctorPayload.id, ...doctorPayload }),
        ).unwrap();
        doctorId = result.id;
      } else {
        const result = await dispatch(createDoctor(doctorPayload)).unwrap();
        doctorId = result.id;
      }

      // Save working hours if provided
      if (workingHours && workingHours.length > 0 && doctorId) {
        try {
          const whResponse = await apiFetch(`${API_BASE_URL}/working-hours/${doctorId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workingHours }),
          });

          if (!whResponse.ok) {
            console.error("Failed to save working hours");
          }
        } catch (error) {
          console.error("Error saving working hours:", error);
        }
      }

      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error submitting doctor:", error);
    }
  };

  const openDeleteModal = (doctor) => {
    setDeleteTarget(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteDoctor(deleteTarget.id));
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleToggleActive = async (doctor, isActive) => {
    if (!doctor?.id || isLoading) return;

    setTogglingDoctorIds((prev) => ({ ...prev, [doctor.id]: true }));
    try {
      await dispatch(updateDoctor({ id: doctor.id, is_active: isActive })).unwrap();
    } catch (error) {
      showErrorToast(error || "Не вдалося оновити статус лікаря");
    } finally {
      setTogglingDoctorIds((prev) => {
        const next = { ...prev };
        delete next[doctor.id];
        return next;
      });
    }
  };

  const handleOpenWorkingHoursDrawer = async (doctor) => {
    if (!doctor?.id) return;

    setHoursDoctor(doctor);
    setIsHoursDrawerOpen(true);
    setIsWorkingHoursLoading(true);

    try {
      const response = await apiFetch(`${API_BASE_URL}/working-hours/${doctor.id}`);
      if (!response.ok) throw new Error("Не вдалося завантажити графік лікаря");
      const result = await response.json();
      setWorkingHours(result.data || []);
    } catch (error) {
      setWorkingHours([]);
      showErrorToast(error.message || "Не вдалося завантажити графік лікаря");
    } finally {
      setIsWorkingHoursLoading(false);
    }
  };

  const handleCloseWorkingHoursDrawer = () => {
    setIsHoursDrawerOpen(false);
  };

  const handleOpenTimeOffModal = (doctor) => {
    if (!doctor?.id) return;

    setTimeOffDoctor({
      id: doctor.id,
      name: getDoctorFullName(doctor),
    });
    setIsTimeOffModalOpen(true);
  };

  const handleCloseTimeOffModal = () => {
    setIsTimeOffModalOpen(false);
    setTimeOffDoctor(null);
  };

  const workingHoursByDay = useMemo(() => {
    const map = new Map();
    (workingHours || []).forEach((entry) => {
      map.set(Number(entry.day_of_week), entry);
    });
    return map;
  }, [workingHours]);

  const columns = getDoctorsColumns({
    onOpenWorkingHours: handleOpenWorkingHoursDrawer,
    onOpenTimeOff: handleOpenTimeOffModal,
    onEdit: openEditModal,
    onDelete: openDeleteModal,
    onToggleActive: handleToggleActive,
    togglingDoctorIds,
    canUpdate: access.update,
    canDelete: access.delete,
  });

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
