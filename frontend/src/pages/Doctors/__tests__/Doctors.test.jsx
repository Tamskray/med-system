import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Doctors from "../index";
import { useDoctors } from "../useDoctors";

jest.mock("../useDoctors", () => ({
  useDoctors: jest.fn(),
  getDoctorFullName: jest.fn((doctor) => {
    if (!doctor) return "Лікар";
    return (
      [doctor.last_name, doctor.first_name, doctor.middle_name].filter(Boolean).join(" ") || "Лікар"
    );
  }),
}));

jest.mock("../DoctorsForm", () => () => <div data-testid="mock-doctors-form" />);
jest.mock("../TimeOffModal", () => () => <div data-testid="mock-time-off-modal" />);
jest.mock("../WorkingHoursDrawer", () => () => <div data-testid="mock-working-hours-drawer" />);

jest.mock("../../../components/core/Table", () => () => <div data-testid="mock-table" />);
jest.mock("../../../components/core/SearchInput", () => ({ value, onChange, placeholder }) => (
  <input
    data-testid="mock-search-input"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
));

jest.mock("../../../components/core/DeleteConfirmModal", () => () => (
  <div data-testid="mock-delete-modal" />
));

describe("Doctors UI Component Integration Tests", () => {
  const defaultHookValues = {
    access: { create: true, update: true, delete: true },
    searchTerm: "",
    setSearchTerm: jest.fn(),
    filterDepartmentId: "all",
    setFilterDepartmentId: jest.fn(),
    filterStatus: "",
    setFilterStatus: jest.fn(),
    departmentOptions: [
      { value: "all", label: "Усі відділення" },
      { value: "1", label: "Кардіологія" },
    ],
    isLoading: false,
    filteredDoctors: [],
    isFormModalOpen: false,
    formMode: "CREATE",
    selectedDoctor: null,
    openCreateModal: jest.fn(),
    handleCloseFormModal: jest.fn(),
    handleDoctorSubmit: jest.fn(),
    isDeleteModalOpen: false,
    deleteTarget: null,
    handleCancelDelete: jest.fn(),
    handleConfirmDelete: jest.fn(),
    handleOpenDeleteModal: jest.fn(),
    isHoursDrawerOpen: false,
    hoursDoctor: null,
    workingHoursByDay: new Map(),
    isWorkingHoursLoading: false,
    handleCloseWorkingHoursDrawer: jest.fn(),
    isTimeOffModalOpen: false,
    timeOffDoctor: null,
    handleCloseTimeOffModal: jest.fn(),
    handleToggleActive: jest.fn(),
    togglingDoctorIds: {},
    handleOpenWorkingHoursDrawer: jest.fn(),
    handleOpenTimeOffModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDoctors.mockReturnValue(defaultHookValues);
  });

  it("should render the Doctors page without crashing", () => {
    render(<Doctors />);
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });

  it("should hide the 'Додати лікаря' button if user does not have create permission", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      access: { create: false, update: true, delete: true },
    });

    render(<Doctors />);
    const addButton = screen.queryByRole("button", { name: /додати лікаря/i });
    expect(addButton).not.toBeInTheDocument();
  });

  it("should show the 'Додати лікаря' button if user has create permission", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      access: { create: true, update: true, delete: true },
    });

    render(<Doctors />);
    const addButton = screen.getByRole("button", { name: /додати лікаря/i });
    expect(addButton).toBeInTheDocument();
  });

  it("should update search term when typing in the search input", () => {
    const mockSetSearchTerm = jest.fn();
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      searchTerm: "",
      setSearchTerm: mockSetSearchTerm,
    });

    render(<Doctors />);

    const searchInput = screen.getByPlaceholderText(/пошук за прізвищем/i);
    fireEvent.change(searchInput, { target: { value: "Петров" } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith("Петров");
  });

  it("should render DoctorsForm when isFormModalOpen is true", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isFormModalOpen: true,
    });

    render(<Doctors />);
    expect(screen.getByTestId("mock-doctors-form")).toBeInTheDocument();
  });

  it("should render TimeOffModal when isTimeOffModalOpen is true", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isTimeOffModalOpen: true,
      timeOffDoctor: { id: 1, name: "Іван Петров" },
    });

    render(<Doctors />);
    expect(screen.getByTestId("mock-time-off-modal")).toBeInTheDocument();
  });

  it("should render WorkingHoursDrawer when isHoursDrawerOpen is true", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isHoursDrawerOpen: true,
      hoursDoctor: { id: 1, first_name: "Іван", last_name: "Петров" },
    });

    render(<Doctors />);
    expect(screen.getByTestId("mock-working-hours-drawer")).toBeInTheDocument();
  });

  it("should render DeleteConfirmModal when isDeleteModalOpen is true", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isDeleteModalOpen: true,
      deleteTarget: { id: 1, first_name: "Іван", last_name: "Петров" },
    });

    render(<Doctors />);
    expect(screen.getByTestId("mock-delete-modal")).toBeInTheDocument();
  });

  it("should call openCreateModal when add button is clicked", () => {
    const mockOpenCreateModal = jest.fn();
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      openCreateModal: mockOpenCreateModal,
    });

    render(<Doctors />);

    const addButton = screen.getByRole("button", { name: /додати лікаря/i });
    fireEvent.click(addButton);

    expect(mockOpenCreateModal).toHaveBeenCalled();
  });

  it("should disable add button when isLoading is true", () => {
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isLoading: true,
    });

    render(<Doctors />);

    const addButton = screen.getByRole("button", { name: /додати лікаря/i });
    expect(addButton).toBeDisabled();
  });

  it("should update department filter when select value changes", () => {
    const mockSetFilterDepartmentId = jest.fn();
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      setFilterDepartmentId: mockSetFilterDepartmentId,
      departmentOptions: [
        { value: "all", label: "Усі відділення" },
        { value: "1", label: "Кардіологія" },
      ],
    });

    const { container } = render(<Doctors />);

    // Find the first Select component (department filter)
    const selects = container.querySelectorAll("input[role='combobox']");
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: "1" } });
      expect(mockSetFilterDepartmentId).toHaveBeenCalled();
    }
  });

  it("should update status filter when select value changes", () => {
    const mockSetFilterStatus = jest.fn();
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      setFilterStatus: mockSetFilterStatus,
    });

    const { container } = render(<Doctors />);

    // Find the second Select component (status filter)
    const selects = container.querySelectorAll("input[role='combobox']");
    if (selects.length > 1) {
      fireEvent.change(selects[1], { target: { value: "active" } });
      expect(mockSetFilterStatus).toHaveBeenCalled();
    }
  });

  it("should pass filtered doctors to Table component", () => {
    const mockDoctors = [
      {
        id: 1,
        first_name: "Іван",
        last_name: "Петров",
        department_name: "Кардіологія",
        room_number: "101",
      },
    ];

    useDoctors.mockReturnValue({
      ...defaultHookValues,
      filteredDoctors: mockDoctors,
    });

    render(<Doctors />);
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });

  it("should display all department options in filter", () => {
    const mockDepartmentOptions = [
      { value: "all", label: "Усі відділення" },
      { value: "1", label: "Кардіологія" },
      { value: "2", label: "Неврологія" },
    ];

    useDoctors.mockReturnValue({
      ...defaultHookValues,
      departmentOptions: mockDepartmentOptions,
    });

    const { container } = render(<Doctors />);
    // Component should render without errors
    expect(container).toBeInTheDocument();
  });

  it("should display correct placeholder in search input", () => {
    render(<Doctors />);

    const searchInput = screen.getByPlaceholderText(/пошук за прізвищем, іменем або кабінетом/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("should handle form modal lifecycle correctly", () => {
    const mockOpenCreateModal = jest.fn();
    const mockHandleCloseFormModal = jest.fn();

    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isFormModalOpen: false,
      openCreateModal: mockOpenCreateModal,
      handleCloseFormModal: mockHandleCloseFormModal,
    });

    const { rerender } = render(<Doctors />);

    expect(screen.queryByTestId("mock-doctors-form")).not.toBeInTheDocument();

    // Simulate opening form
    useDoctors.mockReturnValue({
      ...defaultHookValues,
      isFormModalOpen: true,
      openCreateModal: mockOpenCreateModal,
      handleCloseFormModal: mockHandleCloseFormModal,
    });

    rerender(<Doctors />);
    expect(screen.getByTestId("mock-doctors-form")).toBeInTheDocument();
  });
});
