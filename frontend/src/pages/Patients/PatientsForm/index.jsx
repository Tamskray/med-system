import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Modal from "../../../components/core/Modal";
import { PATIENT_FORM_MODES } from "../constants";

const defaultPatientFormValues = {
  id: null,
  last_name: "",
  first_name: "",
  middle_name: "",
  date_of_birth: "",
  phone: "",
  email: "",
};

const getInitialFormValues = (mode, initialValues) => {
  if (mode === PATIENT_FORM_MODES.EDIT && initialValues) {
    return {
      ...defaultPatientFormValues,
      ...initialValues,
      date_of_birth: initialValues.date_of_birth ?? "",
    };
  }

  return defaultPatientFormValues;
};

function PatientsForm({ open, mode, initialValues, isLoading, onClose, onSubmit }) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(mode, initialValues));
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.last_name.trim()) errors.last_name = "Прізвище обов'язкове";
    if (!formValues.first_name.trim()) errors.first_name = "Ім'я обов'язкове";

    return errors;
  };

  const handleSubmit = () => {
    if (isLoading) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit({
      ...formValues,
      date_of_birth: formValues.date_of_birth || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === PATIENT_FORM_MODES.EDIT ? "Редагувати пацієнта" : "Додати пацієнта"}
      onSubmit={handleSubmit}
      submitText={mode === PATIENT_FORM_MODES.EDIT ? "Зберегти" : "Створити"}
      submitDisabled={isLoading}
    >
      <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
        <TextField
          label="Прізвище"
          value={formValues.last_name}
          onChange={handleChange("last_name")}
          error={Boolean(formErrors.last_name)}
          helperText={formErrors.last_name}
          fullWidth
          size="small"
        />
        <TextField
          label="Ім'я"
          value={formValues.first_name}
          onChange={handleChange("first_name")}
          error={Boolean(formErrors.first_name)}
          helperText={formErrors.first_name}
          fullWidth
          size="small"
        />
        <TextField
          label="По батькові"
          value={formValues.middle_name}
          onChange={handleChange("middle_name")}
          fullWidth
          size="small"
        />
        <TextField
          label="Дата народження"
          type="date"
          value={formValues.date_of_birth}
          onChange={handleChange("date_of_birth")}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Телефон"
          value={formValues.phone}
          onChange={handleChange("phone")}
          fullWidth
          size="small"
        />
        <TextField
          label="Email"
          type="email"
          value={formValues.email}
          onChange={handleChange("email")}
          fullWidth
          size="small"
        />
      </Box>
    </Modal>
  );
}

export default PatientsForm;
