import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/core/Button";
import Table from "../../components/core/Table";
import SearchInput from "../../components/core/SearchInput";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import PatientsForm from "./PatientsForm";
import { getPatientsColumns } from "./columns.jsx";
import { PATIENT_FORM_MODES } from "./constants";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../../redux/slices/patients";
import { useAccess } from "../../hooks/useAccess";
import { toolbarSx, searchInputSx } from "./styles";

function Patients() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { patients, isLoading } = useSelector((state) => state.patients);
  const access = useAccess("patients");

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(PATIENT_FORM_MODES.CREATE);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!searchTerm.trim()) return patients;

    return patients.filter((patient) => {
      const search = searchTerm.toLowerCase();
      return (
        patient.last_name?.toLowerCase().includes(search) ||
        patient.first_name?.toLowerCase().includes(search) ||
        patient.phone?.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, patients]);

  const openCreateModal = () => {
    setFormMode(PATIENT_FORM_MODES.CREATE);
    setSelectedPatient(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (patient) => {
    setFormMode(PATIENT_FORM_MODES.EDIT);
    setSelectedPatient(patient);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
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

  const openDeleteModal = (patient) => {
    setDeleteTarget(patient);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deletePatient(deleteTarget.id));
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleOpenProfile = (patient) => {
    if (!patient?.id) return;
    navigate(`/patients/${patient.id}`);
  };

  const columns = getPatientsColumns({
    onEdit: openEditModal,
    onDelete: openDeleteModal,
    canUpdate: access.update,
    canDelete: access.delete,
  });

  return (
    <Box>
      <Box sx={toolbarSx}>
        <SearchInput
          placeholder="Пошук за прізвищем, іменем або телефоном..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={searchInputSx}
        />
        {access.create && (
          <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
            Додати
          </Button>
        )}
      </Box>

      <Table
        data={filteredPatients}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleOpenProfile}
      />

      {isFormModalOpen && (
        <PatientsForm
          key={`${formMode}-${selectedPatient?.id ?? "new"}`}
          open={isFormModalOpen}
          mode={formMode}
          initialValues={selectedPatient}
          isLoading={isLoading}
          onClose={handleCloseFormModal}
          onSubmit={handlePatientSubmit}
        />
      )}

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={[deleteTarget?.last_name, deleteTarget?.first_name].filter(Boolean).join(" ")}
        itemLabel="patient"
        isLoading={isLoading}
      />
    </Box>
  );
}

export default Patients;
