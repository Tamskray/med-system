import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { useAccess } from "../../hooks/useAccess";
import { useConfirmModal } from "../../hooks/useConfirmModal";

import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../redux/slices/doctors";
import { getDoctorsColumns } from "./columns.jsx";
import { DOCTOR_FORM_MODES, DOCTOR_DEPARTMENT_ALL_OPTION } from "./constants";
import { apiFetch } from "../../utils/api";
import { API_BASE_URL } from "../../utils/config";
import { showErrorToast } from "../../utils/toast";

export const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ") || "Лікар";

export const useDoctors = () => {
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

  const deleteModal = useConfirmModal();

  const [isHoursDrawerOpen, setIsHoursDrawerOpen] = useState(false);
  const [hoursDoctor, setHoursDoctor] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [isWorkingHoursLoading, setIsWorkingHoursLoading] = useState(false);

  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [timeOffDoctor, setTimeOffDoctor] = useState(null);

  const [togglingDoctorIds, setTogglingDoctorIds] = useState({});

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
    setSelectedDoctor(null);
  };

  const handleDoctorSubmit = async (doctorData) => {
    if (isLoading) return;

    try {
      const { workingHours: whData, ...doctorPayload } = doctorData;
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

      if (whData && whData.length > 0 && doctorId) {
        try {
          const whResponse = await apiFetch(`${API_BASE_URL}/working-hours/${doctorId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workingHours: whData }),
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

  const handleConfirmDelete = () => {
    if (!deleteModal.target) return;
    dispatch(deleteDoctor(deleteModal.target.id));
    deleteModal.close();
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
    onDelete: deleteModal.open,
    onToggleActive: handleToggleActive,
    togglingDoctorIds,
    canUpdate: access.update,
    canDelete: access.delete,
  });

  return {
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
    isDeleteModalOpen: deleteModal.isOpen,
    deleteTarget: deleteModal.target,
    isHoursDrawerOpen,
    hoursDoctor,
    workingHours,
    workingHoursByDay,
    isWorkingHoursLoading,
    isTimeOffModalOpen,
    timeOffDoctor,
    togglingDoctorIds,
    setSearchTerm,
    setFilterDepartmentId,
    setFilterStatus,
    openCreateModal,
    openEditModal,
    handleCloseFormModal,
    handleDoctorSubmit,
    handleCancelDelete: deleteModal.close,
    handleConfirmDelete,
    handleOpenWorkingHoursDrawer,
    handleCloseWorkingHoursDrawer,
    handleOpenTimeOffModal,
    handleCloseTimeOffModal,
    handleToggleActive,
  };
};
