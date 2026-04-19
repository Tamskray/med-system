import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Modal from "../../../components/core/Modal";
import { DOCTOR_FORM_MODES } from "../constants";

const defaultDoctorFormValues = {
  id: null,
  name: "",
  specialty: "",
  experience: "",
  contact: "",
};

const getInitialFormValues = (mode, initialValues) => {
  if (mode === DOCTOR_FORM_MODES.EDIT && initialValues) {
    return { ...defaultDoctorFormValues, ...initialValues };
  }

  return defaultDoctorFormValues;
};

function DoctorsForm({ open, mode, initialValues, isLoading, onClose, onSubmit }) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(mode, initialValues));
  const [formErrors, setFormErrors] = useState({});

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
    if (isLoading) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit(formValues);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === DOCTOR_FORM_MODES.EDIT ? "Edit Doctor" : "Create Doctor"}
      onSubmit={handleSubmit}
      submitText={mode === DOCTOR_FORM_MODES.EDIT ? "Update" : "Create"}
      submitDisabled={isLoading}
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
  );
}

export default DoctorsForm;
