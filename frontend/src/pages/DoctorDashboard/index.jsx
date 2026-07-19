import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  pageWrapperSx,
  titleSx,
  filtersRowSx,
  dateControlsSx,
  dateFieldSx,
  doctorReadonlySx,
  doctorReadonlyLabelSx,
  doctorReadonlyNameSx,
  doctorSelectControlSx,
  loadingAppointmentsBoxSx,
  freeSlotsPaperSx,
  freeSlotsTitleSx,
  workingHoursLoadingSx,
  freeSlotsCountSx,
  freeSlotsListSx,
  appointmentsListSx,
  appointmentCardSx,
  appointmentTimeSx,
  appointmentActionSx,
} from "./styles";
import { useDoctorDashboard } from "./useDoctorDashboard";

function DoctorDashboard() {
  const {
    selectedDoctorId,
    selectedDate,
    appointments,
    isLoadingAppointments,
    workingHoursForDay,
    isLoadingWorkingHours,
    freeSlots,
    sortedDoctors,
    currentUserDoctor,
    isLoggedInDoctor,
    currentUser,
    setSelectedDoctorId,
    setSelectedDate,
    handleOpenPatientRecord,
    shiftIsoDate,
    formatTime,
    getDoctorFullName,
    getPatientFullName,
  } = useDoctorDashboard();

  return (
    <Box sx={pageWrapperSx}>
      <Typography variant="h6" sx={titleSx}>
        Розклад лікаря
      </Typography>

      <Box sx={filtersRowSx}>
        <Box sx={dateControlsSx}>
          <IconButton
            aria-label="Попередній день"
            onClick={() => setSelectedDate((prev) => shiftIsoDate(prev, -1))}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <TextField
            type="date"
            label="Дата"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={dateFieldSx}
          />
          <IconButton
            aria-label="Наступний день"
            onClick={() => setSelectedDate((prev) => shiftIsoDate(prev, 1))}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {isLoggedInDoctor ? (
          <Box sx={doctorReadonlySx}>
            <Typography variant="caption" color="text.secondary" sx={doctorReadonlyLabelSx}>
              Лікар
            </Typography>
            <Typography variant="body2" sx={doctorReadonlyNameSx}>
              {getDoctorFullName(currentUserDoctor) || currentUser?.username || "-"}
            </Typography>
          </Box>
        ) : (
          <FormControl size="small" sx={doctorSelectControlSx}>
            <Select
              displayEmpty
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              renderValue={(value) => {
                if (!value) return "Оберіть лікаря для перегляду...";
                const doctor = sortedDoctors.find((item) => String(item.id) === String(value));
                return doctor ? getDoctorFullName(doctor) : "Оберіть лікаря для перегляду...";
              }}
            >
              <MenuItem value="">Оберіть лікаря для перегляду...</MenuItem>
              {sortedDoctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {getDoctorFullName(doctor)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {!selectedDoctorId && (
        <Typography variant="body1" color="text.secondary">
          Будь ласка, оберіть лікаря
        </Typography>
      )}

      {selectedDoctorId && isLoadingAppointments && (
        <Box sx={loadingAppointmentsBoxSx}>
          <CircularProgress size={28} />
        </Box>
      )}

      {selectedDoctorId && (
        <Paper variant="outlined" elevation={0} sx={freeSlotsPaperSx}>
          <Typography variant="subtitle2" sx={freeSlotsTitleSx}>
            Вільні слоти
          </Typography>

          {isLoadingWorkingHours ? (
            <Box sx={workingHoursLoadingSx}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Завантаження робочих годин...
              </Typography>
            </Box>
          ) : !workingHoursForDay ? (
            <Typography variant="body2" color="text.secondary">
              Лікар не працює у цей день
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={freeSlotsCountSx}>
                Доступно слотів: <strong>{freeSlots.length}</strong>
              </Typography>
              <Box sx={freeSlotsListSx}>
                {freeSlots.length ? (
                  freeSlots.map((slot) => (
                    <Chip
                      key={`${slot.start}-${slot.end}`}
                      label={`${slot.start} - ${slot.end}`}
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Вільних слотів немає
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>
      )}

      {selectedDoctorId && !isLoadingAppointments && appointments.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          На обрану дату записів немає
        </Typography>
      )}

      {selectedDoctorId && !isLoadingAppointments && appointments.length > 0 && (
        <Box sx={appointmentsListSx}>
          {appointments.map((appointment) => (
            <Paper key={appointment.id} variant="outlined" elevation={0} sx={appointmentCardSx}>
              <Typography variant="subtitle1" sx={appointmentTimeSx}>
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </Typography>

              <Typography variant="body2">
                <strong>Пацієнт:</strong> {getPatientFullName(appointment)}
              </Typography>

              <Typography variant="body2">
                <strong>Статус:</strong> {appointment.status || "Заплановано"}
              </Typography>

              <Typography variant="body2">
                <strong>Тип/Причина:</strong> {appointment.appointment_type || "-"}
              </Typography>

              <Box sx={appointmentActionSx}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenPatientRecord(appointment)}
                  disabled={!appointment.patient_id}
                >
                  Відкрити картку
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default DoctorDashboard;
