import { usePatients } from "./usePatients";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import PatientsForm from "./PatientsForm";

import Button from "../../components/core/Button";
import DeleteConfirmModal from "../../components/core/DeleteConfirmModal";
import SearchInput from "../../components/core/SearchInput";
import Table from "../../components/core/Table";

import { PATIENT_FORM_MODES } from "./constants";

import { toolbarSx, searchInputSx } from "./styles";

function Patients() {
  const {
    access,
    search,
    isLoading,
    filteredPatients,
    columns,
    isFormModalOpen,
    formMode,
    selectedPatient,
    isDeleteModalOpen,
    deleteTarget,
    handleOpenProfile,
    setSearch,
    openCreateModal,
    handleCloseFormModal,
    handlePatientSubmit,
    handleCancelDelete,
    handleConfirmDelete,
  } = usePatients();

  return (
    <Box>
      <Box sx={toolbarSx}>
        <SearchInput
          placeholder="Пошук за прізвищем, іменем або телефоном..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={searchInputSx}
        />
        {access.create && (
          <Button variant="contained" onClick={openCreateModal} disabled={isLoading}>
            Додати
          </Button>
        )}
      </Box>

      <Table
        data={filteredPatients}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleOpenProfile}
      />

      {isFormModalOpen && (
        <PatientsForm
          key={`${formMode}-${selectedPatient?.id ?? "new"}`}
          open={isFormModalOpen}
          mode={formMode}
          initialValues={selectedPatient}
          isLoading={isLoading}
          onClose={handleCloseFormModal}
          onSubmit={handlePatientSubmit}
        />
      )}

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={[deleteTarget?.last_name, deleteTarget?.first_name].filter(Boolean).join(" ")}
        itemLabel="patient"
        isLoading={isLoading}
      />
    </Box>
  );
}

export default Patients;
