import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../../redux/slices/doctors";
import {
  fetchPatientProfileData,
  updateAppointmentStatus,
  createMedicalRecord,
  clearPatientProfile,
} from "../../redux/slices/patientProfile";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Table from "../../components/core/Table";
import { showErrorToast } from "../../utils/toast";
import { ROLE_IDS } from "../../constants/roles";
import { APPOINTMENT_STATUS_OPTIONS, ROLE_DOCTOR, ROLE_RECEPTIONIST } from "./constants";
import { getAppointmentHistoryColumns } from "./columns";
import {
  pageWrapperSx,
  topSectionPaperSx,
  topSectionBoxSx,
  patientNameSx,
  patientMetaSx,
  actionsColumnSx,
  loadingPaperSx,
  infoPaperSx,
  infoRowLabelSx,
  historyPaperSx,
  historyTitleSx,
  medicalSectionGridSx,
  currentVisitRowSx,
  currentVisitChipSx,
  currentVisitStatusSx,
  historyScrollSx,
  historyRecordSx,
  historyRecordContentSx,
  newRecordPaperSx,
  newRecordTitleSx,
  newRecordFormSx,
  saveButtonRowSx,
  doctorLinkButtonSx,
  getStatusChipStyles,
} from "./styles";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("uk-UA");
};

const formatTime = (value) => {
  if (!value) return "-";
  return String(value).slice(11, 16);
};

const getPatientFullName = (patient) =>
  [patient?.last_name, patient?.first_name, patient?.middle_name].filter(Boolean).join(" ") ||
  "Пацієнт";

const getDoctorFullName = (doctor) =>
  [doctor?.last_name, doctor?.first_name, doctor?.middle_name].filter(Boolean).join(" ") || "-";

const parseAttachmentsInput = (value) =>
  String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={infoRowLabelSx}>
        {label}
      </Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );
}

function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { doctors } = useSelector((state) => state.doctors);
  const { patient, appointments, medicalRecords, isLoading, isSavingRecord } = useSelector(
    (state) => state.patientProfile,
  );

  const isLoggedInDoctor = useMemo(
    () => Number(currentUser?.role_id) === ROLE_IDS.DOCTOR,
    [currentUser?.role_id],
  );

  const isLoggedInAdmin = useMemo(
    () => (Number(currentUser?.role_id) === currentUser?.is_super_admin) === true,
    [currentUser?.role_id, currentUser?.is_super_admin],
  );

  const [mockUserRole, setMockUserRole] = useState(
    isLoggedInDoctor ? ROLE_DOCTOR : ROLE_RECEPTIONIST,
  );
  const [tabValue, setTabValue] = useState(0);

  const [newRecordForm, setNewRecordForm] = useState({
    symptoms: "",
    diagnosis: "",
    prescription_notes: "",
    attachments_input: "",
  });

  const isDoctor = isLoggedInDoctor || mockUserRole === ROLE_DOCTOR;

  const effectiveTabValue = !isDoctor && tabValue === 2 ? 1 : tabValue;

  useEffect(() => {
    if (isDoctor) {
      dispatch(fetchDoctors());
    }
  }, [dispatch, isDoctor]);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPatientProfileData({ patientId: id, isDoctor }));
    return () => {
      dispatch(clearPatientProfile());
    };
  }, [id, isDoctor, dispatch]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        String(b.start_time || "").localeCompare(String(a.start_time || "")),
      ),
    [appointments],
  );

  const activeAppointment = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (
      appointments.find((a) => {
        const date = String(a.appointment_date || a.start_time || "").slice(0, 10);
        return date === today && a.status !== "Завершено" && a.status !== "Скасовано";
      }) || null
    );
  }, [appointments]);

  const currentUserDoctorId = useMemo(() => {
    const currentDoctor = (doctors || []).find(
      (doctor) => String(doctor.user_id) === String(currentUser?.id),
    );
    return currentDoctor?.id ? Number(currentDoctor.id) : null;
  }, [doctors, currentUser?.id]);

  const getDoctorDisplayName = (doctorId) => {
    if (!doctorId) return "-";

    const doctor = (doctors || []).find((item) => String(item.id) === String(doctorId));
    return doctor ? getDoctorFullName(doctor) : `ID ${doctorId}`;
  };

  const appointmentHistoryColumns = useMemo(
    () =>
      getAppointmentHistoryColumns({
        navigate,
        getDoctorFullName,
        formatDate,
        formatTime,
        doctorLinkButtonSx,
        getStatusChipStyles,
      }),
    [navigate],
  );

  const handleRoleChange = (_, nextRole) => {
    if (!nextRole) return;
    setMockUserRole(nextRole);
  };

  const handleRecordFieldChange = (field) => (event) => {
    setNewRecordForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleStatusChange = (newStatus) => {
    if (!activeAppointment) return;
    dispatch(updateAppointmentStatus({ appointmentId: activeAppointment.id, status: newStatus }));
  };

  const handleSaveRecord = async () => {
    if (!isDoctor || !id || !newRecordForm.diagnosis.trim()) {
      showErrorToast("Діагноз є обов'язковим");
      return;
    }

    const result = await dispatch(
      createMedicalRecord({
        patient_id: Number(id),
        doctor_id: currentUserDoctorId ?? (Number(activeAppointment?.doctor_id) || null),
        appointment_id: Number(activeAppointment?.id) || null,
        symptoms: newRecordForm.symptoms.trim(),
        diagnosis: newRecordForm.diagnosis.trim(),
        prescription_notes: newRecordForm.prescription_notes.trim(),
        attachments: parseAttachmentsInput(newRecordForm.attachments_input),
      }),
    );

    if (!result.error) {
      setNewRecordForm({
        symptoms: "",
        diagnosis: "",
        prescription_notes: "",
        attachments_input: "",
      });
    }
  };

  return (
    <Box sx={pageWrapperSx}>
      <Paper variant="outlined" elevation={0} sx={topSectionPaperSx}>
        <Box sx={topSectionBoxSx}>
          <Box>
            <Typography variant="h5" sx={patientNameSx}>
              {getPatientFullName(patient)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={patientMetaSx}>
              Телефон: {patient?.phone || "-"} | Email: {patient?.email || "-"} | Дата народження:{" "}
              {formatDate(patient?.date_of_birth)}
            </Typography>
          </Box>

          <Box sx={actionsColumnSx}>
            {!isLoggedInDoctor && (
              <ToggleButtonGroup
                size="small"
                color="primary"
                value={mockUserRole}
                exclusive
                onChange={handleRoleChange}
                aria-label="Перемикач ролі"
              >
                <ToggleButton value={ROLE_RECEPTIONIST}>Реєстратор</ToggleButton>
                <ToggleButton value={ROLE_DOCTOR} disabled={!isLoggedInAdmin}>
                  Лікар
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            <Button variant="outlined" onClick={() => navigate(-1)}>
              Повернутися назад
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" elevation={0}>
        <Tabs value={effectiveTabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab value={0} label="Загальна інформація" />
          <Tab value={1} label="Історія візитів" />
          {isDoctor && <Tab value={2} label="Медична картка" />}
        </Tabs>
      </Paper>

      {isLoading ? (
        <Paper variant="outlined" elevation={0} sx={loadingPaperSx}>
          <CircularProgress size={30} />
        </Paper>
      ) : (
        <>
          {effectiveTabValue === 0 && (
            <Paper variant="outlined" elevation={0} sx={infoPaperSx}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="Прізвище" value={patient?.last_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="Ім'я" value={patient?.first_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="По батькові" value={patient?.middle_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="Дата народження" value={formatDate(patient?.date_of_birth)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="Телефон" value={patient?.phone} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoRow label="Email" value={patient?.email} />
                </Grid>
              </Grid>
            </Paper>
          )}

          {effectiveTabValue === 1 && (
            <Paper variant="outlined" elevation={0} sx={historyPaperSx}>
              <Table
                data={sortedAppointments}
                columns={appointmentHistoryColumns}
                emptyText="Візити відсутні"
              />
            </Paper>
          )}

          {isDoctor && effectiveTabValue === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper variant="outlined" elevation={0} sx={historyPaperSx}>
                <Box sx={currentVisitRowSx}>
                  <Typography variant="body1">Поточний візит:</Typography>
                  {activeAppointment ? (
                    <Chip
                      label={`${formatDate(activeAppointment.appointment_date || activeAppointment.start_time)} ${formatTime(activeAppointment.start_time)} - ${formatTime(activeAppointment.end_time)}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={currentVisitChipSx}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      На сьогодні активних візитів немає
                    </Typography>
                  )}
                  {activeAppointment && (
                    <TextField
                      select
                      size="small"
                      label="Статус"
                      value={activeAppointment.status || ""}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      sx={currentVisitStatusSx}
                    >
                      {APPOINTMENT_STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Box>
              </Paper>

              <Box sx={medicalSectionGridSx}>
                <Paper variant="outlined" elevation={0} sx={historyPaperSx}>
                  <Typography variant="subtitle1" sx={historyTitleSx}>
                    Історія медичних записів
                  </Typography>
                  <Box sx={historyScrollSx}>
                    {medicalRecords.length ? (
                      medicalRecords.map((record) => (
                        <Box key={record.id} variant="outlined" sx={historyRecordSx}>
                          <CardContent sx={historyRecordContentSx}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(record.created_at)} {formatTime(record.created_at)}
                            </Typography>
                            {record.symptoms && (
                              <Typography variant="body2">
                                <strong>Симптоми:</strong> {record.symptoms}
                              </Typography>
                            )}
                            <Typography variant="body2">
                              <strong>Діагноз:</strong> {record.diagnosis || "-"}
                            </Typography>
                            {record.prescription_notes && (
                              <Typography variant="body2">
                                <strong>Призначення:</strong> {record.prescription_notes}
                              </Typography>
                            )}
                            <Typography variant="body2">
                              <strong>Лікар:</strong> {getDoctorDisplayName(record.doctor_id)}
                            </Typography>
                          </CardContent>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Медичних записів поки немає
                      </Typography>
                    )}
                  </Box>
                </Paper>

                <Paper variant="outlined" elevation={0} sx={newRecordPaperSx}>
                  <Typography variant="subtitle1" sx={newRecordTitleSx}>
                    Новий запис
                  </Typography>
                  <Box sx={newRecordFormSx}>
                    <TextField
                      label="Симптоми"
                      multiline
                      minRows={3}
                      value={newRecordForm.symptoms}
                      onChange={handleRecordFieldChange("symptoms")}
                    />
                    <TextField
                      label="Діагноз"
                      multiline
                      minRows={3}
                      value={newRecordForm.diagnosis}
                      onChange={handleRecordFieldChange("diagnosis")}
                    />
                    <TextField
                      label="Призначення"
                      multiline
                      minRows={3}
                      value={newRecordForm.prescription_notes}
                      onChange={handleRecordFieldChange("prescription_notes")}
                    />
                    <TextField
                      label="Вкладення (URL або текст, через кому чи з нового рядка)"
                      multiline
                      minRows={2}
                      value={newRecordForm.attachments_input}
                      onChange={handleRecordFieldChange("attachments_input")}
                    />

                    <Divider />

                    <Box sx={saveButtonRowSx}>
                      <Button
                        variant="contained"
                        onClick={handleSaveRecord}
                        disabled={isSavingRecord}
                      >
                        {isSavingRecord ? "Збереження..." : "Зберегти"}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default PatientProfile;
