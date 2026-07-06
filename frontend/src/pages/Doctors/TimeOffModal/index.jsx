import { useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import Modal from "../../../components/core/Modal";
import { apiFetch } from "../../../utils/api";
import { API_BASE_URL } from "../../../utils/config";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

const TIME_OFF_REASON_OPTIONS = ["Відпустка", "Лікарняний", "Особисті причини", "Інше"];

const initialFormState = {
  startDate: null,
  endDate: null,
  reason: TIME_OFF_REASON_OPTIONS[0],
};

const toIsoDate = (value) => (value ? value.format("YYYY-MM-DD") : "");

const isValidDateValue = (value) => dayjs.isDayjs(value) && value.isValid();

const getPatientFullName = (patient) =>
  [patient?.last_name, patient?.first_name, patient?.middle_name].filter(Boolean).join(" ") ||
  "Без пацієнта";

const formatTime = (value) => String(value || "").slice(11, 16) || "--:--";

const buildConflictMessage = (count) =>
  `Неможливо зберегти. На ці дати у лікаря є заплановані візити (${count} записів). Скасуйте або перенесіть їх у розкладі спочатку.`;

const MAX_TIME_OFF_DAYS = 14;

export default function TimeOffModal({ open, onClose, doctorId, doctorName, onSuccess }) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    startDate: false,
    endDate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewState, setPreviewState] = useState({
    isLoading: false,
    error: "",
    count: 0,
    appointments: [],
  });
  const [submitConflictMessage, setSubmitConflictMessage] = useState("");
  const today = useMemo(() => dayjs().startOf("day"), []);

  useEffect(() => {
    if (!open) return;

    setFormValues(initialFormState);
    setIsSubmitAttempted(false);
    setTouchedFields({
      startDate: false,
      endDate: false,
    });
    setIsSubmitting(false);
    setPreviewState({
      isLoading: false,
      error: "",
      count: 0,
      appointments: [],
    });
    setSubmitConflictMessage("");
  }, [open, doctorId]);

  const validationErrors = useMemo(() => {
    const errors = {};
    const hasValidStartDate = isValidDateValue(formValues.startDate);
    const hasValidEndDate = isValidDateValue(formValues.endDate);

    if (!formValues.startDate) {
      errors.startDate = "Оберіть дату початку";
    } else if (!hasValidStartDate) {
      errors.startDate = "Некоректна дата початку";
    }

    if (!formValues.endDate) {
      errors.endDate = "Оберіть дату завершення";
    } else if (!hasValidEndDate) {
      errors.endDate = "Некоректна дата завершення";
    }

    if (
      hasValidStartDate &&
      formValues.startDate.startOf("day").isBefore(today) &&
      !formValues.startDate.isSame(today, "day")
    ) {
      errors.startDate = "Дата початку не може бути в минулому";
    }

    if (
      hasValidStartDate &&
      hasValidEndDate &&
      formValues.endDate.isBefore(formValues.startDate, "day")
    ) {
      errors.endDate = "Дата завершення не може бути раніше дати початку";
    }

    if (
      hasValidStartDate &&
      hasValidEndDate &&
      formValues.endDate.isAfter(formValues.startDate.add(MAX_TIME_OFF_DAYS, "day"), "day")
    ) {
      errors.endDate = "Дата завершення не може бути більш ніж на 2 тижні пізніше дати початку";
    }

    return errors;
  }, [formValues.endDate, formValues.startDate, today]);

  useEffect(() => {
    if (!open || !doctorId || validationErrors.startDate || validationErrors.endDate) {
      setPreviewState((prev) => ({
        ...prev,
        isLoading: false,
        error: "",
        count: 0,
        appointments: [],
      }));
      return;
    }

    if (!formValues.startDate || !formValues.endDate) {
      return;
    }

    let isActive = true;

    const loadConflicts = async () => {
      setPreviewState((prev) => ({ ...prev, isLoading: true, error: "" }));

      try {
        const params = new URLSearchParams({
          start_date: toIsoDate(formValues.startDate),
          end_date: toIsoDate(formValues.endDate),
        });
        const response = await apiFetch(
          `${API_BASE_URL}/doctors/${doctorId}/time-off-conflicts?${params.toString()}`,
        );

        if (!response.ok) {
          const errorResult = await response.json().catch(() => null);
          throw new Error(errorResult?.message || "Не вдалося перевірити розклад лікаря");
        }

        const result = await response.json();

        if (!isActive) return;

        setPreviewState({
          isLoading: false,
          error: "",
          count: result.data?.count || 0,
          appointments: result.data?.appointments || [],
        });
      } catch (error) {
        if (!isActive) return;

        setPreviewState({
          isLoading: false,
          error: error.message || "Не вдалося перевірити розклад лікаря",
          count: 0,
          appointments: [],
        });
      }
    };

    loadConflicts();

    return () => {
      isActive = false;
    };
  }, [
    doctorId,
    formValues.endDate,
    formValues.startDate,
    open,
    validationErrors.endDate,
    validationErrors.startDate,
  ]);

  const groupedAppointments = useMemo(() => {
    return (previewState.appointments || []).reduce((acc, appointment) => {
      const dateKey = appointment.appointment_date || "Без дати";
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});
  }, [previewState.appointments]);

  const handleFieldChange = (field) => (value) => {
    setFormValues((prev) => ({ ...prev, [field]: value || null }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    setSubmitConflictMessage("");
  };

  const handleFieldBlur = (field) => () => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleReasonChange = (event) => {
    setFormValues((prev) => ({ ...prev, reason: event.target.value }));
    setSubmitConflictMessage("");
  };

  const handleSubmit = async () => {
    setIsSubmitAttempted(true);
    setSubmitConflictMessage("");

    if (!doctorId || Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch(`${API_BASE_URL}/doctors/${doctorId}/time-offs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctorId,
          start_date: toIsoDate(formValues.startDate),
          end_date: toIsoDate(formValues.endDate),
          reason: formValues.reason,
        }),
      });

      if (response.status === 409) {
        const errorResult = await response.json().catch(() => null);
        const conflictCount = errorResult?.count || previewState.count || 0;
        const conflictAppointments = errorResult?.appointments || previewState.appointments || [];

        setPreviewState((prev) => ({
          ...prev,
          count: conflictCount,
          appointments: conflictAppointments,
        }));
        setSubmitConflictMessage(buildConflictMessage(conflictCount));
        return;
      }

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        throw new Error(errorResult?.message || "Не вдалося зберегти вихідні");
      }

      showSuccessToast("Вихідні успішно додано");
      onSuccess?.();
      onClose();
    } catch (error) {
      showErrorToast(error.message || "Не вдалося зберегти вихідні");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPreviewConflicts = previewState.count > 0;
  const shouldShowStartDateError =
    Boolean(validationErrors.startDate) && (isSubmitAttempted || touchedFields.startDate);
  const shouldShowEndDateError =
    Boolean(validationErrors.endDate) && (isSubmitAttempted || touchedFields.endDate);
  const isSubmitDisabled =
    isSubmitting ||
    previewState.isLoading ||
    hasPreviewConflicts ||
    Object.keys(validationErrors).length > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
      <Modal
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`Додати відпустку / вихідний для ${doctorName || "лікаря"}`}
        submitText="Зберегти"
        cancelText="Скасувати"
        width="640px"
        submitDisabled={isSubmitDisabled}
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          {submitConflictMessage && <Alert severity="error">{submitConflictMessage}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <DatePicker
              label="Дата початку"
              value={formValues.startDate}
              disablePast
              minDate={today}
              onChange={handleFieldChange("startDate")}
              slotProps={{
                textField: {
                  size: "small",
                  required: true,
                  onKeyDown: (event) => event.preventDefault(),
                  onBlur: handleFieldBlur("startDate"),
                  error: shouldShowStartDateError,
                  helperText: shouldShowStartDateError ? validationErrors.startDate : "",
                },
              }}
            />

            <DatePicker
              label="Дата завершення"
              value={formValues.endDate}
              disablePast
              minDate={formValues.startDate || today}
              maxDate={
                formValues.startDate
                  ? formValues.startDate.add(MAX_TIME_OFF_DAYS, "day")
                  : today.add(MAX_TIME_OFF_DAYS, "day")
              }
              onChange={handleFieldChange("endDate")}
              slotProps={{
                textField: {
                  size: "small",
                  required: true,
                  onKeyDown: (event) => event.preventDefault(),
                  onBlur: handleFieldBlur("endDate"),
                  error: shouldShowEndDateError,
                  helperText: shouldShowEndDateError ? validationErrors.endDate : "",
                },
              }}
            />
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel id="time-off-reason-label">Причина</InputLabel>
            <Select
              labelId="time-off-reason-label"
              label="Причина"
              value={formValues.reason}
              onChange={handleReasonChange}
            >
              {TIME_OFF_REASON_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: hasPreviewConflicts ? "warning.main" : "divider",
              backgroundColor: hasPreviewConflicts ? "warning.50" : "background.default",
            }}
          >
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    Перевірка розкладу в обраному діапазоні
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Після вибору дат тут з&apos;являться заплановані візити лікаря на цей період.
                  </Typography>
                </Box>
                {previewState.isLoading && <CircularProgress size={20} />}
              </Box>

              {previewState.error && <Alert severity="error">{previewState.error}</Alert>}

              {!previewState.error &&
                !previewState.isLoading &&
                formValues.startDate &&
                formValues.endDate &&
                !hasPreviewConflicts && (
                  <Alert severity="success">
                    У вибраному діапазоні активних записів не знайдено.
                  </Alert>
                )}

              {!previewState.error && hasPreviewConflicts && (
                <>
                  <Alert severity="warning">
                    На вибрані дати знайдено {previewState.count} активних записів. Перед
                    збереженням їх потрібно скасувати або перенести.
                  </Alert>

                  <Stack spacing={1}>
                    {Object.entries(groupedAppointments).map(([date, appointments]) => (
                      <Paper
                        key={date}
                        variant="outlined"
                        sx={{ p: 1.25, backgroundColor: "common.white" }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                          {dayjs(date).format("DD.MM.YYYY")} • {appointments.length} записів
                        </Typography>
                        <Stack spacing={0.75}>
                          {appointments.map((appointment) => (
                            <Box
                              key={appointment.id}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                                fontSize: 14,
                              }}
                            >
                              <Typography variant="body2">
                                {formatTime(appointment.start_time)} -{" "}
                                {formatTime(appointment.end_time)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {getPatientFullName(appointment.patients)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Modal>
    </LocalizationProvider>
  );
}
