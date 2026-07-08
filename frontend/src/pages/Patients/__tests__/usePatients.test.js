import { renderHook, act } from "@testing-library/react";
import { usePatients } from "../usePatients";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAccess } from "../../../hooks/useAccess";
import { PATIENT_FORM_MODES } from "../constants";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
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

jest.mock("../../../hooks/useDebounce", () => ({
  useDebounce: (value) => value,
}));

jest.mock("../../../redux/slices/patients", () => ({
  fetchPatients: jest.fn(() => ({ type: "patients/fetchPatients" })),
  createPatient: jest.fn(() => ({ type: "patients/createPatient" })),
  updatePatient: jest.fn(() => ({ type: "patients/updatePatient" })),
  deletePatient: jest.fn(() => ({ type: "patients/deletePatient" })),
}));

describe("usePatients Custom Hook", () => {
  let mockDispatch;
  let mockNavigate;
  const mockPatients = [
    { id: 1, first_name: "Тарас", last_name: "Шевченко", phone: "123" },
    { id: 2, first_name: "Іван", last_name: "Франко", phone: "456" },
  ];

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useAccess.mockReturnValue({ create: true, update: true, delete: true });
    useSelector.mockReturnValue({ patients: mockPatients, isLoading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch patients on initial initialization", () => {
    renderHook(() => usePatients());
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should correctly filter patients by search term case-insensitively", () => {
    const { result } = renderHook(() => usePatients());

    act(() => {
      result.current.setSearch("шевченко");
    });

    expect(result.current.filteredPatients).toHaveLength(1);
    expect(result.current.filteredPatients[0].first_name).toBe("Тарас");
  });

  it("should handle modal state management when opening create modal", () => {
    const { result } = renderHook(() => usePatients());

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.isFormModalOpen).toBe(true);
    expect(result.current.formMode).toBe(PATIENT_FORM_MODES.CREATE);
  });
});
