import { useState, useMemo, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/core/Button";
import Table from "../../components/core/Table";
import SearchInput from "../../components/core/SearchInput";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import DoctorsForm from "./DoctorsForm";
import { getDoctorsColumns } from "./columns.jsx";
import { DOCTOR_FORM_MODES } from "./constants";
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../redux/slices/doctors";

const API_BASE_URL = "http://localhost:5000/api";

function Doctors() {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(DOCTOR_FORM_MODES.CREATE);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const departments = useMemo(() => {
    if (!doctors) return [];
    const seen = new Set();
    return doctors
      .filter((d) => d.department_id && d.department_name)
      .reduce((acc, d) => {
        if (!seen.has(d.department_id)) {
          seen.add(d.department_id);
          acc.push({ id: d.department_id, name: d.department_name });
        }
        return acc;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];

    return doctors.filter((doctor) => {
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          doctor.last_name?.toLowerCase().includes(search) ||
          doctor.first_name?.toLowerCase().includes(search) ||
          doctor.room_number?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filterDepartmentId !== "" && doctor.department_id !== filterDepartmentId) return false;

      if (filterStatus !== "") {
        const isActive = filterStatus === "active";
        if (doctor.is_active !== isActive) return false;
      }

      return true;
    });
  }, [searchTerm, filterDepartmentId, filterStatus, doctors]);

  const openCreateModal = () => {
    setFormMode(DOCTOR_FORM_MODES.CREATE);
    setSelectedDoctor(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setFormMode(DOCTOR_FORM_MODES.EDIT);
    setSelectedDoctor(doctor);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleDoctorSubmit = async (doctorData) => {
    if (isLoading) return;

    try {
      const { workingHours, ...doctorPayload } = doctorData;
      let doctorId;

      if (formMode === DOCTOR_FORM_MODES.EDIT) {
        const result = await dispatch(
          updateDoctor({ id: doctorPayload.id, ...doctorPayload }),
        ).unwrap();
        doctorId = result.id;
      } else {
        const result = await dispatch(createDoctor(doctorPayload)).unwrap();
        doctorId = result.id;
      }

      // Save working hours if provided
      if (workingHours && workingHours.length > 0 && doctorId) {
        try {
          const whResponse = await fetch(`${API_BASE_URL}/working-hours/${doctorId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workingHours }),
          });

          if (!whResponse.ok) {
            console.error("Failed to save working hours");
          }
        } catch (error) {
          console.error("Error saving working hours:", error);
        }
      }

      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error submitting doctor:", error);
    }
  };

  const openDeleteModal = (doctor) => {
    setDeleteTarget(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteDoctor(deleteTarget.id));
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const columns = getDoctorsColumns({ onEdit: openEditModal, onDelete: openDeleteModal });

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Doctors List
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <SearchInput
          placeholder="Пошук за прізвищем, іменем або кабінетом..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 280, maxWidth: 520 }}
        />
        <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
          Create
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            displayEmpty
            value={filterDepartmentId}
            onChange={(e) => setFilterDepartmentId(e.target.value)}
            renderValue={(value) =>
              value === ""
                ? "Усі відділення"
                : (departments.find((d) => d.id === value)?.name ?? "Усі відділення")
            }
          >
            <MenuItem value="">Усі відділення</MenuItem>
            {departments.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            displayEmpty
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            renderValue={(value) =>
              ({ "": "Усі статуси", active: "Активний", inactive: "Неактивний" })[value] ??
              "Усі статуси"
            }
          >
            <MenuItem value="">Усі статуси</MenuItem>
            <MenuItem value="active">Активний</MenuItem>
            <MenuItem value="inactive">Неактивний</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Table data={filteredDoctors} columns={columns} isLoading={isLoading} />

      {isFormModalOpen && (
        <DoctorsForm
          key={`${formMode}-${selectedDoctor?.id ?? "new"}`}
          open={isFormModalOpen}
          mode={formMode}
          initialValues={selectedDoctor}
          isLoading={isLoading}
          onClose={handleCloseFormModal}
          onSubmit={handleDoctorSubmit}
        />
      )}

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={[deleteTarget?.last_name, deleteTarget?.first_name].filter(Boolean).join(" ")}
        itemLabel="doctor"
        isLoading={isLoading}
      />
    </Box>
  );
}

export default Doctors;
