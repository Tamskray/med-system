import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { showErrorToast, showSuccessToast } from "../utils/toast";

const API_BASE_URL = "http://localhost:5000/api";

const ROLE_RECEPTIONIST = "Receptionist";
const ROLE_DOCTOR = "Doctor";

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

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );
}

function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mockUserRole, setMockUserRole] = useState(ROLE_RECEPTIONIST);
  const [tabValue, setTabValue] = useState(0);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  const [newRecordForm, setNewRecordForm] = useState({
    symptoms: "",
    diagnosis: "",
    prescription_notes: "",
  });

  const isDoctor = mockUserRole === ROLE_DOCTOR;

  useEffect(() => {
    if (!isDoctor && tabValue === 2) {
      setTabValue(1);
    }
  }, [isDoctor, tabValue]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const requests = [
          fetch(`${API_BASE_URL}/patients/${encodeURIComponent(id)}`),
          fetch(`${API_BASE_URL}/appointments?patient_id=${encodeURIComponent(id)}`),
          isDoctor
            ? fetch(`${API_BASE_URL}/medical-records?patient_id=${encodeURIComponent(id)}`)
            : Promise.resolve(null),
        ];

        const [patientResponse, appointmentsResponse, recordsResponse] =
          await Promise.all(requests);

        if (!patientResponse.ok) {
          throw new Error("Не вдалося завантажити профіль пацієнта");
        }

        if (!appointmentsResponse.ok) {
          throw new Error("Не вдалося завантажити історію візитів");
        }

        if (isDoctor && recordsResponse && !recordsResponse.ok) {
          throw new Error("Не вдалося завантажити медичну картку");
        }

        const patientResult = await patientResponse.json();
        const appointmentsResult = await appointmentsResponse.json();
        const recordsResult = isDoctor && recordsResponse ? await recordsResponse.json() : null;

        if (!isActive) return;

        setPatient(patientResult.data || null);
        setAppointments(appointmentsResult.data || []);
        setMedicalRecords(recordsResult?.data || []);
      } catch (error) {
        if (isActive) {
          setPatient(null);
          setAppointments([]);
          setMedicalRecords([]);
        }
        showErrorToast(error.message || "Помилка завантаження даних");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [id, isDoctor]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        String(b.start_time || "").localeCompare(String(a.start_time || "")),
      ),
    [appointments],
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

  const handleSaveRecord = async () => {
    if (!isDoctor || !id || !newRecordForm.diagnosis.trim()) {
      showErrorToast("Діагноз є обов'язковим");
      return;
    }

    setIsSavingRecord(true);
    try {
      const response = await fetch(`${API_BASE_URL}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: Number(id),
          symptoms: newRecordForm.symptoms.trim(),
          diagnosis: newRecordForm.diagnosis.trim(),
          prescription_notes: newRecordForm.prescription_notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося зберегти медичний запис");
      }

      const result = await response.json();
      setMedicalRecords((prev) => [result.data, ...prev]);
      setNewRecordForm({
        symptoms: "",
        diagnosis: "",
        prescription_notes: "",
      });
      showSuccessToast("Медичний запис збережено");
    } catch (error) {
      showErrorToast(error.message || "Не вдалося зберегти запис");
    } finally {
      setIsSavingRecord(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper variant="outlined" elevation={0} sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {getPatientFullName(patient)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Телефон: {patient?.phone || "-"} | Email: {patient?.email || "-"} | Дата народження:{" "}
              {formatDate(patient?.date_of_birth)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={mockUserRole}
              exclusive
              onChange={handleRoleChange}
              aria-label="Перемикач ролі"
            >
              <ToggleButton value={ROLE_RECEPTIONIST}>Реєстратор</ToggleButton>
              <ToggleButton value={ROLE_DOCTOR}>Лікар</ToggleButton>
            </ToggleButtonGroup>

            <Button variant="outlined" onClick={() => navigate(-1)}>
              Повернутися назад
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" elevation={0}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab value={0} label="Загальна інформація" />
          <Tab value={1} label="Історія візитів" />
          {isDoctor && <Tab value={2} label="Медична картка" />}
        </Tabs>
      </Paper>

      {isLoading ? (
        <Paper
          variant="outlined"
          elevation={0}
          sx={{ p: 4, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress size={30} />
        </Paper>
      ) : (
        <>
          {tabValue === 0 && (
            <Paper variant="outlined" elevation={0} sx={{ p: 2.5 }}>
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

          {tabValue === 1 && (
            <Paper variant="outlined" elevation={0} sx={{ p: 2.5 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Час</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Тип</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAppointments.length ? (
                      sortedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {formatDate(appointment.appointment_date || appointment.start_time)}
                          </TableCell>
                          <TableCell>
                            {formatTime(appointment.start_time)} -{" "}
                            {formatTime(appointment.end_time)}
                          </TableCell>
                          <TableCell>{appointment.status || "-"}</TableCell>
                          <TableCell>{appointment.appointment_type || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Візити відсутні
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {isDoctor && tabValue === 2 && (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
              }}
            >
              <Paper variant="outlined" elevation={0} sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Історія медичних записів
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {medicalRecords.length ? (
                    medicalRecords.map((record) => (
                      <Card key={record.id} variant="outlined" sx={{ boxShadow: "none" }}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(record.created_at)}
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
                          {(record.attachments || []).length > 0 && (
                            <Box>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Вкладення:</strong>
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {record.attachments.map((url, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    component="a"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: "primary.main" }}
                                  >
                                    Файл {index + 1}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Медичних записів поки немає
                    </Typography>
                  )}
                </Box>
              </Paper>

              <Paper variant="outlined" elevation={0} sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Новий запис
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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

                  <Divider />

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
          )}
        </>
      )}
    </Box>
  );
}

export default PatientProfile;
