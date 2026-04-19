import { useState, useMemo, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/core/Button";
import Table from "../../components/core/Table";
import SearchInput from "../../components/core/SearchInput";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import DoctorsForm from "./DoctorsForm";
import { getDoctorsColumns } from "./columns.jsx";
import { DOCTOR_FORM_MODES } from "./constants";
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../redux/slices/doctors";

function Doctors() {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(DOCTOR_FORM_MODES.CREATE);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    if (!searchTerm.trim()) return doctors;

    return doctors.filter((doctor) => {
      const search = searchTerm.toLowerCase();
      return (
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search) ||
        doctor.contact.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, doctors]);

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

  const handleDoctorSubmit = (doctorData) => {
    if (isLoading) return;

    if (formMode === DOCTOR_FORM_MODES.EDIT) {
      dispatch(updateDoctor({ id: doctorData.id, ...doctorData }));
    } else {
      dispatch(
        createDoctor({
          name: doctorData.name,
          specialty: doctorData.specialty,
          experience: doctorData.experience,
          contact: doctorData.contact,
        }),
      );
    }

    setIsFormModalOpen(false);
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

  const columns = getDoctorsColumns({ onEdit: openEditModal, onDelete: openDeleteModal });

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Doctors List
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
          placeholder="Search by name, specialty, or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 280, maxWidth: 520 }}
        />
        <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
          Create
        </Button>
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

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name}
        itemLabel="doctor"
        isLoading={isLoading}
      />
    </Box>
  );
}

export default Doctors;
