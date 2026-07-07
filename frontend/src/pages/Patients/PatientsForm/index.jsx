import { usePatientsForm } from "./usePatientsForm";

import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import "dayjs/locale/uk";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import Modal from "../../../components/core/Modal";
import PhoneMask from "../../../components/core/PhoneMask";
import DatePicker from "../../../components/core/DatePicker";

import { GENDER_OPTIONS, PATIENT_FORM_MODES } from "../constants";
import { fieldsGridSx } from "./styles";

function PatientsForm({ open, mode, initialValues, isLoading, onClose, onSubmit }) {
  const { control, errors, submitForm } = usePatientsForm({
    mode,
    initialValues,
    onSubmit,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === PATIENT_FORM_MODES.EDIT ? "Редагувати пацієнта" : "Додати пацієнта"}
      onSubmit={submitForm}
      submitText={mode === PATIENT_FORM_MODES.EDIT ? "Зберегти" : "Додати"}
      submitDisabled={isLoading}
    >
      <Box sx={fieldsGridSx}>
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Прізвище"
              error={Boolean(errors.last_name)}
              helperText={errors.last_name?.message}
              fullWidth
              size="small"
            />
          )}
        />

        <Controller
          name="first_name2"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ім'я"
              error={Boolean(errors.first_name)}
              helperText={errors.first_name?.message}
              fullWidth
              size="small"
            />
          )}
        />

        <Controller
          name="middle_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="По батькові"
              error={Boolean(errors.middle_name)}
              helperText={errors.middle_name?.message}
              fullWidth
              size="small"
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Стать"
              select
              error={Boolean(errors.gender)}
              helperText={errors.gender?.message}
              fullWidth
              size="small"
            >
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value || "none"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="date_of_birth"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              label="Дата народження"
              value={value}
              onChange={onChange}
              disableFuture
              format="DD.MM.YYYY"
              referenceDate={dayjs().subtract(30, "year")}
              error={errors.date_of_birth}
              helperText={errors.date_of_birth?.message}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Телефон"
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              fullWidth
              size="small"
              InputProps={{
                inputComponent: PhoneMask,
              }}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              fullWidth
              size="small"
            />
          )}
        />
      </Box>
    </Modal>
  );
}

export default PatientsForm;
