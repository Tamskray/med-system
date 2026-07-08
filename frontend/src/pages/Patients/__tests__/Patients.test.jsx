import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Patients from "../index";
import { usePatients } from "../usePatients";

jest.mock("../usePatients", () => ({
  usePatients: jest.fn(),
}));
jest.mock("../PatientsForm", () => () => <div data-testid="mock-patient-form" />);

jest.mock("../../../components/core/Table", () => () => <div data-testid="mock-table" />);

describe("Patients UI Component", () => {
  const defaultHookValues = {
    access: { create: true, update: true, delete: true },
    search: "",
    isLoading: false,
    filteredPatients: [],
    columns: [],
    isFormModalOpen: false,
    formMode: "CREATE",
    selectedPatient: null,
    isDeleteModalOpen: false,
    deleteTarget: null,
    handleOpenProfile: jest.fn(),
    setSearch: jest.fn(),
    openCreateModal: jest.fn(),
    handleCloseFormModal: jest.fn(),
    handlePatientSubmit: jest.fn(),
    handleCancelDelete: jest.fn(),
    handleConfirmDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should hide the 'Додати' button if the user does not have create permission", () => {
    usePatients.mockReturnValue({
      ...defaultHookValues,
      access: { create: false, update: true, delete: true },
    });

    render(<Patients />);

    const addButton = screen.queryByRole("button", { name: /додати/i });
    expect(addButton).not.toBeInTheDocument();
  });

  it("should update search value when typing in the search bar", () => {
    const mockSetSearch = jest.fn();
    usePatients.mockReturnValue({
      ...defaultHookValues,
      search: "Іван",
      setSearch: mockSetSearch,
    });

    render(<Patients />);

    const input = screen.getByPlaceholderText(/пошук за прізвищем/i);
    fireEvent.change(input, { target: { value: "Петро" } });

    expect(mockSetSearch).toHaveBeenCalledWith("Петро");
  });

  it("should render the PatientsForm when isFormModalOpen is true", () => {
    usePatients.mockReturnValue({
      ...defaultHookValues,
      isFormModalOpen: true,
    });

    render(<Patients />);

    expect(screen.getByTestId("mock-patient-form")).toBeInTheDocument();
  });
});
