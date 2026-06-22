import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Modal from "../../../components/core/Modal";
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_TYPE_OPTIONS, BREAK } from "../constants";
import {
  modalFormGridSx,
  slotInfoCardSx,
  slotInfoDoctorNameSx,
  captionBlockSx,
  getCancellationReasonSx,
} from "../styles";

export default function AppointmentForm({
  open,
  onClose,
  onSubmit,
  selectedAppointment,
  selectedSlot,
  selectedDate,
  patients,
  isPatientsLoading,
  isSubmitting,
  isSubmitAttempted,
  formValues,
  onFieldChange,
  onPatientChange,
  onAddPatient,
  onDelete,
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isBreak = formValues.appointment_type === BREAK;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={selectedAppointment ? "Редагувати запис" : "Створити запис"}
        onSubmit={onSubmit}
        submitText={selectedAppointment ? "Оновити" : "Підтвердити"}
        cancelText="Скасувати"
        submitDisabled={isSubmitting}
      >
        <Box sx={modalFormGridSx}>
          <Box sx={slotInfoCardSx}>
            <Typography variant="body2" sx={slotInfoDoctorNameSx}>
              {selectedSlot?.doctorName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={captionBlockSx}>
              {selectedSlot?.departmentName} | Кабінет: {selectedSlot?.roomNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={captionBlockSx}>
              {selectedAppointment?.appointment_date || selectedDate} | {selectedSlot?.start} -{" "}
              {selectedSlot?.end}
            </Typography>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Тип запису
            </Typography>
            <RadioGroup
              row
              value={formValues.appointment_type}
              onChange={onFieldChange("appointment_type")}
            >
              {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </Box>

          {!isBreak && (
            <>
              <Autocomplete
                options={patients || []}
                loading={isPatientsLoading}
                value={
                  (patients || []).find((patient) => patient.id === formValues.patient_id) || null
                }
                onChange={onPatientChange}
                getOptionLabel={(option) =>
                  [option.last_name, option.first_name, option.middle_name]
                    .filter(Boolean)
                    .join(" ")
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {[option.last_name, option.first_name, option.middle_name]
                      .filter(Boolean)
                      .join(" ")}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Пацієнт"
                    size="small"
                    placeholder="Пошук пацієнта..."
                    autoComplete="off"
                    error={isSubmitAttempted && !formValues.patient_id}
                    helperText={
                      isSubmitAttempted && !formValues.patient_id ? "Обов'язкове поле" : ""
                    }
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: "new-password",
                      "data-lpignore": "true",
                      "data-1p-ignore": "true",
                    }}
                  />
                )}
                noOptionsText="Пацієнтів не знайдено"
              />

              <Button variant="outlined" onClick={onAddPatient}>
                Додати нового пацієнта
              </Button>
            </>
          )}

          {!isBreak && (
            <TextField
              label="Статус"
              select
              value={formValues.status}
              onChange={onFieldChange("status")}
              fullWidth
              size="small"
              disabled={!selectedAppointment}
            >
              {APPOINTMENT_STATUS_OPTIONS.filter((o) => !o.editOnly || selectedAppointment).map(
                (o) => (
                  <MenuItem
                    key={o.value}
                    value={o.value}
                    disabled={o.disabledIfCompleted && selectedAppointment?.status === "Завершено"}
                  >
                    {o.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          )}

          {!isBreak && (
            <TextField
              label="Причина скасування"
              value={formValues.cancellation_reason}
              onChange={onFieldChange("cancellation_reason")}
              fullWidth
              size="small"
              sx={getCancellationReasonSx(formValues.status === "Скасовано")}
            />
          )}

          <TextField
            label="Нотатки"
            value={formValues.notes}
            onChange={onFieldChange("notes")}
            autoComplete="off"
            inputProps={{
              autoComplete: "new-password",
              "data-lpignore": "true",
              "data-1p-ignore": "true",
            }}
            fullWidth
            size="small"
            multiline
            minRows={3}
          />

          {selectedAppointment && !isBreak && (
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setDeleteConfirmOpen(true)} color="error" variant="outlined">
                Видалити запис
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Видалити цей запис?</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити цей запис? Цю дію не можна скасувати.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Скасувати</Button>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              onDelete?.(selectedAppointment.id);
            }}
            color="error"
            variant="contained"
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
