import { useState, useMemo, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../components/core/Table";
import Modal from "../../components/core/Modal";
import SearchInput from "../../components/core/SearchInput";
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../redux/slices/doctors";

function Doctors() {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formValues, setFormValues] = useState({
    id: null,
    name: "",
    specialty: "",
    experience: "",
    contact: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filteredDoctors = useMemo(() => {
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

  const resetForm = () => {
    setFormValues({
      id: null,
      name: "",
      specialty: "",
      experience: "",
      contact: "",
    });
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setFormValues({ ...doctor });
    setFormErrors({});
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.name.trim()) errors.name = "Name is required";
    if (!formValues.specialty.trim()) errors.specialty = "Specialty is required";
    if (!formValues.experience.trim()) errors.experience = "Experience is required";
    if (!formValues.contact.trim()) errors.contact = "Contact is required";

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === "edit") {
      dispatch(updateDoctor({ id: formValues.id, ...formValues }));
    } else {
      dispatch(
        createDoctor({
          name: formValues.name,
          specialty: formValues.specialty,
          experience: formValues.experience,
          contact: formValues.contact,
        }),
      );
    }

    setIsModalOpen(false);
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

  const columns = [
    { key: "name", label: "Name", width: 180, minWidth: 150 },
    { key: "specialty", label: "Specialty", width: 160, minWidth: 140 },
    { key: "experience", label: "Experience", width: 130, minWidth: 110 },
    { key: "contact", label: "Contact", width: 200, minWidth: 180 },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      minWidth: 80,
      maxWidth: 100,
      sortable: false,
      render: (row) => (
        <>
          <IconButton
            size="small"
            onClick={() => openEditModal(row)}
            sx={{ "&:focus": { outline: "none" } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => openDeleteModal(row)}
            sx={{ "&:focus": { outline: "none" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

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
        <Button variant="contained" onClick={openCreateModal}>
          Create
        </Button>
      </Box>
      <Table data={filteredDoctors} columns={columns} />
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === "edit" ? "Edit Doctor" : "Create Doctor"}
        onSubmit={handleSubmit}
        submitText={modalMode === "edit" ? "Update" : "Create"}
      >
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formValues.name}
            onChange={handleFormChange("name")}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
            fullWidth
            size="small"
          />
          <TextField
            label="Specialty"
            value={formValues.specialty}
            onChange={handleFormChange("specialty")}
            error={Boolean(formErrors.specialty)}
            helperText={formErrors.specialty}
            fullWidth
            size="small"
          />
          <TextField
            label="Experience"
            value={formValues.experience}
            onChange={handleFormChange("experience")}
            error={Boolean(formErrors.experience)}
            helperText={formErrors.experience}
            fullWidth
            size="small"
          />
          <TextField
            label="Contact"
            value={formValues.contact}
            onChange={handleFormChange("contact")}
            error={Boolean(formErrors.contact)}
            helperText={formErrors.contact}
            fullWidth
            size="small"
          />
        </Box>
      </Modal>

      <Modal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Confirm Delete"
        onSubmit={handleConfirmDelete}
        submitText="Delete"
        submitVariant="outlined"
        submitSx={{ borderColor: "error.main", color: "error.main" }}
      >
        <Box sx={{ mt: 1 }}>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name || "this doctor"}</strong>?
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}

export default Doctors;
