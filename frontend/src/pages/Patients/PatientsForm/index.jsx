import { useMemo, useState } from "react";

import dayjs from "dayjs";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import "dayjs/locale/uk";
import Modal from "../../../components/core/Modal";
import { GENDER_OPTIONS, PATIENT_FORM_MODES } from "../constants";
import { fieldsGridSx } from "./styles";

const defaultPatientFormValues = {
  id: null,
  last_name: "",
  first_name: "",
  middle_name: "",
  gender: "",
  date_of_birth: "",
  phone: "",
  email: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_CHARS_REGEX = /^\+?[\d\s()\-]+$/;

const toPickerDate = (value) => {
  if (!value) return null;
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate : null;
};

const isValidPhone = (value) => {
  const normalizedPhone = value.trim();
  if (!normalizedPhone) return true;

  if (!PHONE_ALLOWED_CHARS_REGEX.test(normalizedPhone)) return false;

  const digitsOnly = normalizedPhone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

const isValidEmail = (value) => {
  const normalizedEmail = value.trim();
  if (!normalizedEmail) return true;
  return EMAIL_REGEX.test(normalizedEmail);
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
  const dateOfBirthValue = useMemo(
    () => toPickerDate(formValues.date_of_birth),
    [formValues.date_of_birth],
  );

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDateOfBirthChange = (value) => {
    setFormValues((prev) => ({
      ...prev,
      date_of_birth: value && value.isValid() ? value.format("YYYY-MM-DD") : "",
    }));

    if (formErrors.date_of_birth) {
      setFormErrors((prev) => ({ ...prev, date_of_birth: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneValue = formValues.phone.trim();
    const emailValue = formValues.email.trim();

    if (!formValues.last_name.trim()) errors.last_name = "Прізвище обов'язкове";
    if (!formValues.first_name.trim()) errors.first_name = "Ім'я обов'язкове";
    if (!isValidPhone(phoneValue)) {
      errors.phone = "Вкажіть коректний номер телефону";
    }

    if (!isValidEmail(emailValue)) {
      errors.email = "Вкажіть коректний email";
    }

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
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
      <Modal
        open={open}
        onClose={onClose}
        title={mode === PATIENT_FORM_MODES.EDIT ? "Редагувати пацієнта" : "Додати пацієнта"}
        onSubmit={handleSubmit}
        submitText={mode === PATIENT_FORM_MODES.EDIT ? "Зберегти" : "Додати"}
        submitDisabled={isLoading}
      >
        <Box sx={fieldsGridSx}>
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
            label="Стать"
            select
            value={formValues.gender}
            onChange={handleChange("gender")}
            fullWidth
            size="small"
          >
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option.value || "none"} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Дата народження"
            value={dateOfBirthValue}
            onChange={handleDateOfBirthChange}
            disableFuture
            format="DD.MM.YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                onKeyDown: (event) => event.preventDefault(),
                error: Boolean(formErrors.date_of_birth),
                helperText: formErrors.date_of_birth,
              },
            }}
          />
          <TextField
            label="Телефон"
            value={formValues.phone}
            onChange={handleChange("phone")}
            error={Boolean(formErrors.phone)}
            helperText={formErrors.phone}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            type="email"
            value={formValues.email}
            onChange={handleChange("email")}
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
            fullWidth
            size="small"
          />
        </Box>
      </Modal>
    </LocalizationProvider>
  );
}

export default PatientsForm;
