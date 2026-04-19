import { useState, useMemo, useEffect } from "react";
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

function Patients() {
  const dispatch = useDispatch();
  const { patients, isLoading } = useSelector((state) => state.patients);

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

  const columns = getPatientsColumns({ onEdit: openEditModal, onDelete: openDeleteModal });

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Пацієнти
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <SearchInput
          placeholder="Пошук за прізвищем, іменем або телефоном..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 280, maxWidth: 520 }}
        />
        <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
          Створити
        </Button>
      </Box>

      <Table data={filteredPatients} columns={columns} isLoading={isLoading} />

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
