import { renderHook, act } from "@testing-library/react";
import { useDoctors } from "../useDoctors";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { useAccess } from "../../../hooks/useAccess";
import { DOCTOR_FORM_MODES, DOCTOR_DEPARTMENT_ALL_OPTION } from "../constants";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("../../../hooks/useAccess", () => ({
  useAccess: jest.fn(),
}));

jest.mock("../../../hooks/useConfirmModal", () => ({
  useConfirmModal: () => ({
    isOpen: false,
    target: null,
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

jest.mock("../../../utils/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../../../utils/toast", () => ({
  showErrorToast: jest.fn(),
}));

jest.mock("../../../utils/config", () => ({
  API_BASE_URL: "http://localhost:3000/api",
}));

jest.mock("../../../redux/slices/doctors", () => ({
  fetchDoctors: jest.fn(() => ({ type: "doctors/fetchDoctors" })),
  createDoctor: jest.fn(() => ({ type: "doctors/createDoctor" })),
  updateDoctor: jest.fn(() => ({ type: "doctors/updateDoctor" })),
  deleteDoctor: jest.fn(() => ({ type: "doctors/deleteDoctor" })),
}));

describe("useDoctors Custom Hook", () => {
  let mockDispatch;
  const mockDoctors = [
    {
      id: 1,
      first_name: "Іван",
      last_name: "Петров",
      middle_name: "Миколайович",
      department_id: 1,
      department_name: "Кардіологія",
      room_number: "101",
      is_active: true,
    },
    {
      id: 2,
      first_name: "Ольга",
      last_name: "Сідельнікова",
      middle_name: "Вадимівна",
      department_id: 2,
      department_name: "Неврологія",
      room_number: "202",
      is_active: false,
    },
  ];

  beforeEach(() => {
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
    useAccess.mockReturnValue({ create: true, update: true, delete: true });
    useSelector.mockReturnValue({ doctors: mockDoctors, isLoading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch doctors on initial initialization", () => {
    renderHook(() => useDoctors());
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should correctly filter doctors by search term case-insensitively", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setSearchTerm("петров");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].first_name).toBe("Іван");
  });

  it("should filter doctors by department", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setFilterDepartmentId("2");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].department_id).toBe(2);
  });

  it("should filter doctors by active status", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setFilterStatus("active");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].is_active).toBe(true);
  });

  it("should filter doctors by inactive status", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setFilterStatus("inactive");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].is_active).toBe(false);
  });

  it("should handle modal state management when opening create modal", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.isFormModalOpen).toBe(true);
    expect(result.current.formMode).toBe(DOCTOR_FORM_MODES.CREATE);
  });

  it("should handle modal state management when opening edit modal", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.openEditModal(mockDoctors[0]);
    });

    expect(result.current.isFormModalOpen).toBe(true);
    expect(result.current.formMode).toBe(DOCTOR_FORM_MODES.EDIT);
    expect(result.current.selectedDoctor).toEqual(mockDoctors[0]);
  });

  it("should close form modal and clear selected doctor", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.openEditModal(mockDoctors[0]);
    });

    expect(result.current.selectedDoctor).toBeTruthy();

    act(() => {
      result.current.handleCloseFormModal();
    });

    expect(result.current.isFormModalOpen).toBe(false);
  });

  it("should extract unique departments from doctors", () => {
    const { result } = renderHook(() => useDoctors());

    expect(result.current.departmentOptions).toContainEqual({
      value: DOCTOR_DEPARTMENT_ALL_OPTION.value,
      label: DOCTOR_DEPARTMENT_ALL_OPTION.label,
    });
    expect(result.current.departmentOptions).toContainEqual({
      value: "1",
      label: "Кардіологія",
    });
    expect(result.current.departmentOptions).toContainEqual({
      value: "2",
      label: "Неврологія",
    });
  });

  it("should handle search by doctor room number", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setSearchTerm("101");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].room_number).toBe("101");
  });

  it("should search by full name with multiple terms", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setSearchTerm("Іван Петров");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].first_name).toBe("Іван");
  });

  it("should return empty array when no doctors match filters", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setSearchTerm("nonexistent");
    });

    expect(result.current.filteredDoctors).toHaveLength(0);
  });

  it("should combine multiple filters correctly", () => {
    const { result } = renderHook(() => useDoctors());

    act(() => {
      result.current.setFilterDepartmentId("1");
      result.current.setFilterStatus("active");
    });

    expect(result.current.filteredDoctors).toHaveLength(1);
    expect(result.current.filteredDoctors[0].department_id).toBe(1);
    expect(result.current.filteredDoctors[0].is_active).toBe(true);
  });
});
