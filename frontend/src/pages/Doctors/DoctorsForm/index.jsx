import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Modal from "../../../components/core/Modal";
import { DOCTOR_FORM_MODES } from "../constants";

const API_BASE_URL = "http://localhost:5000/api";

const defaultDoctorFormValues = {
  id: null,
  last_name: "",
  first_name: "",
  middle_name: "",
  department_id: "",
  room_id: "",
  slot_duration_override: "",
  is_active: true,
};

const getInitialFormValues = (mode, initialValues) => {
  if (mode === DOCTOR_FORM_MODES.EDIT && initialValues) {
    return {
      ...defaultDoctorFormValues,
      ...initialValues,
      department_id: initialValues.department_id ?? "",
      room_id: initialValues.room_id ?? "",
      slot_duration_override: initialValues.slot_duration_override ?? "",
    };
  }

  return defaultDoctorFormValues;
};

function DoctorsForm({ open, mode, initialValues, isLoading, onClose, onSubmit }) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(mode, initialValues));
  const [formErrors, setFormErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`)
      .then((res) => res.json())
      .then((data) => setDepartments(data.data || []))
      .catch(() => setDepartments([]));

    fetch(`${API_BASE_URL}/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data.data || []))
      .catch(() => setRooms([]));
  }, []);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSwitchChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.last_name.trim()) errors.last_name = "Прізвище обов'язкове";
    if (!formValues.first_name.trim()) errors.first_name = "Ім'я обов'язкове";
    if (!formValues.department_id) errors.department_id = "Відділення обов'язкове";

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
      slot_duration_override:
        formValues.slot_duration_override !== "" ? Number(formValues.slot_duration_override) : null,
      department_id: Number(formValues.department_id),
      room_id: formValues.room_id !== "" ? Number(formValues.room_id) : null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === DOCTOR_FORM_MODES.EDIT ? "Редагувати лікаря" : "Додати лікаря"}
      onSubmit={handleSubmit}
      submitText={mode === DOCTOR_FORM_MODES.EDIT ? "Зберегти" : "Створити"}
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

        <FormControl fullWidth size="small" error={Boolean(formErrors.department_id)}>
          <InputLabel id="department-label">Відділення</InputLabel>
          <Select
            labelId="department-label"
            value={formValues.department_id}
            onChange={handleChange("department_id")}
            label="Відділення"
          >
            {departments.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.department_id && <FormHelperText>{formErrors.department_id}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="room-label">Кабінет</InputLabel>
          <Select
            labelId="room-label"
            value={formValues.room_id}
            onChange={handleChange("room_id")}
            label="Кабінет"
          >
            <MenuItem value="">
              <em>— Не вказано —</em>
            </MenuItem>
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.room_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Тривалість прийому (хв)"
          type="number"
          value={formValues.slot_duration_override}
          onChange={handleChange("slot_duration_override")}
          fullWidth
          size="small"
          inputProps={{ min: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={formValues.is_active}
              onChange={handleSwitchChange("is_active")}
              color="primary"
            />
          }
          label="Активний"
        />
      </Box>
    </Modal>
  );
}

export default DoctorsForm;
