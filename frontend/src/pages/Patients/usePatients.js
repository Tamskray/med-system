import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";

import { useAccess } from "../../hooks/useAccess";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import { useDebounce } from "../../hooks/useDebounce";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../../redux/slices/patients";

import { getPatientsColumns } from "./columns.jsx";
import { PATIENT_FORM_MODES } from "./constants";

export const usePatients = () => {
  const access = useAccess("patients");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { patients, isLoading } = useSelector((state) => state.patients);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(PATIENT_FORM_MODES.CREATE);

  const deleteModal = useConfirmModal();

  const handleOpenProfile = (patient) => {
    if (!patient?.id) return;
    navigate(`/patients/${patient.id}`);
  };

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!debouncedSearch.trim()) return patients;

    return patients.filter((patient) => {
      const searchTerm = debouncedSearch.toLowerCase();
      return (
        patient.last_name?.toLowerCase().includes(searchTerm) ||
        patient.first_name?.toLowerCase().includes(searchTerm) ||
        patient.phone?.toLowerCase().includes(searchTerm)
      );
    });
  }, [debouncedSearch, patients]);

  const openCreateModal = () => {
    setFormMode(PATIENT_FORM_MODES.CREATE);
    setIsFormModalOpen(true);
  };

  const openEditModal = (patient) => {
    setFormMode(PATIENT_FORM_MODES.EDIT);
    setSelectedPatient(patient);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedPatient(null);
  };

  const handlePatientSubmit = (patientData) => {
    if (isLoading) return;

    if (formMode === PATIENT_FORM_MODES.EDIT) {
      dispatch(updatePatient({ id: patientData.id, ...patientData }));
    } else {
      dispatch(createPatient(patientData));
    }

    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.target) return;
    dispatch(deletePatient(deleteModal.target.id));
    deleteModal.close();
  };

  const columns = getPatientsColumns({
    onEdit: openEditModal,
    onDelete: deleteModal.open,
    canUpdate: access.update,
    canDelete: access.delete,
  });

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  return {
    access,
    search,
    isLoading,
    filteredPatients,
    columns,
    isFormModalOpen,
    formMode,
    selectedPatient,
    isDeleteModalOpen: deleteModal.isOpen,
    deleteTarget: deleteModal.target,
    handleOpenProfile,
    setSearch,
    openCreateModal,
    handleCloseFormModal,
    handlePatientSubmit,
    handleCancelDelete: deleteModal.close,
    handleConfirmDelete,
  };
};
