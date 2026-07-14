import { renderHook, act } from "@testing-library/react";
import { useAdminUsers } from "../useAdminUsers";
import { useAccess } from "../../../hooks/useAccess";
import { apiFetch } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { ROLE_IDS } from "../../../constants/roles";

jest.mock("../../../hooks/useAccess", () => ({
  useAccess: jest.fn(),
}));

jest.mock("../../../utils/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../../../utils/toast", () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));

jest.mock("../../../utils/config", () => ({
  API_BASE_URL: "http://localhost:3000/api",
}));

jest.mock("../columns", () => ({
  getUsersColumns: jest.fn(() => []),
}));

describe("useAdminUsers Custom Hook", () => {
  const mockUsers = [
    {
      id: 1,
      username: "receptionist",
      email: "receptionist@example.com",
      role_id: ROLE_IDS.RECEPTIONIST,
      is_active: true,
    },
    {
      id: 2,
      username: "doctor_user",
      email: "doctor@example.com",
      role_id: ROLE_IDS.DOCTOR,
      is_active: true,
    },
    {
      id: 3,
      username: "inactive_user",
      email: "inactive@example.com",
      role_id: ROLE_IDS.RECEPTIONIST,
      is_active: false,
    },
  ];

  const mockRoles = [
    { id: ROLE_IDS.RECEPTIONIST, name: "Receptionist" },
    { id: ROLE_IDS.DOCTOR, name: "Doctor" },
  ];

  const mockModules = [
    { id: 1, name: "Users Management" },
    { id: 2, name: "Doctors" },
  ];

  beforeEach(() => {
    useAccess.mockReturnValue({
      isSuperAdmin: true,
      create: true,
      update: true,
      delete: true,
    });

    apiFetch.mockImplementation((url) => {
      if (url.includes("/users/roles")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ data: mockRoles })),
        });
      }
      if (url.includes("/users/modules")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ data: mockModules })),
        });
      }
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ data: mockUsers })),
        });
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve("{}") });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should load users, roles, and modules on mount", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(apiFetch).toHaveBeenCalledWith("http://localhost:3000/api/users");
    expect(apiFetch).toHaveBeenCalledWith("http://localhost:3000/api/users/roles");
    expect(apiFetch).toHaveBeenCalledWith("http://localhost:3000/api/users/modules");
  });

  it("should filter users by search term case-insensitively", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("receptionist");
    });

    expect(result.current.filteredUsers).toHaveLength(2);
    expect(result.current.filteredUsers[0].username).toBe("receptionist");
  });

  it("should filter users by email", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("doctor@example.com");
    });

    expect(result.current.filteredUsers).toHaveLength(1);
    expect(result.current.filteredUsers[0].email).toBe("doctor@example.com");
  });

  it("should filter users by role name", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("receptionist");
    });

    expect(result.current.filteredUsers.length).toBeGreaterThan(0);
  });

  it("should filter users by active status", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("неактивний");
    });

    expect(result.current.filteredUsers).toHaveLength(1);
    expect(result.current.filteredUsers[0].is_active).toBe(false);
  });

  it("should open create modal", () => {
    const { result } = renderHook(() => useAdminUsers());

    expect(result.current.isCreateModalOpen).toBe(false);

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.isCreateModalOpen).toBe(true);
  });

  it("should close create modal", () => {
    const { result } = renderHook(() => useAdminUsers());

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.isCreateModalOpen).toBe(true);

    act(() => {
      result.current.closeCreateModal();
    });

    expect(result.current.isCreateModalOpen).toBe(false);
  });

  it("should handle form field changes", () => {
    const { result } = renderHook(() => useAdminUsers());

    act(() => {
      result.current.handleChange("username")({
        target: { value: "newuser" },
      });
    });

    expect(result.current.form.username).toBe("newuser");
  });

  it("should handle is_active switch change", () => {
    const { result } = renderHook(() => useAdminUsers());

    act(() => {
      result.current.handleChange("is_active")({
        target: { checked: false },
      });
    });

    expect(result.current.form.is_active).toBe(false);
  });

  it("should create role name map", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.roleNameById[ROLE_IDS.RECEPTIONIST]).toBe("Receptionist");
    expect(result.current.roleNameById[ROLE_IDS.DOCTOR]).toBe("Doctor");
  });

  it("should detect Doctor role selection", () => {
    const { result } = renderHook(() => useAdminUsers());

    expect(result.current.isDoctoRoleSelected).toBe(false);

    act(() => {
      result.current.handleChange("role_id")({
        target: { value: String(ROLE_IDS.DOCTOR) },
      });
    });

    expect(result.current.isDoctoRoleSelected).toBe(true);
  });

  it("should clear doctor_id when role changes from Doctor", () => {
    const { result } = renderHook(() => useAdminUsers());

    act(() => {
      result.current.handleChange("role_id")({
        target: { value: String(ROLE_IDS.DOCTOR) },
      });
    });

    expect(result.current.isDoctoRoleSelected).toBe(true);

    act(() => {
      result.current.handleChange("doctor_id")({
        target: { value: "1" },
      });
    });

    expect(result.current.form.doctor_id).toBe("1");

    act(() => {
      result.current.handleChange("role_id")({
        target: { value: String(ROLE_IDS.ADMIN) },
      });
    });

    expect(result.current.form.doctor_id).toBe("");
  });

  it("should return empty array when no users match search", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("nonexistent");
    });

    expect(result.current.filteredUsers).toHaveLength(0);
  });

  it("should validate form on submit", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formErrors.username).toBeTruthy();
    expect(result.current.formErrors.email).toBeTruthy();
    expect(result.current.formErrors.password).toBeTruthy();
    expect(result.current.formErrors.role_id).toBeTruthy();
  });

  it("should toggle create role modal", () => {
    const { result } = renderHook(() => useAdminUsers());

    expect(result.current.isCreateRoleModalOpen).toBe(false);

    act(() => {
      result.current.setIsCreateRoleModalOpen(true);
    });

    expect(result.current.isCreateRoleModalOpen).toBe(true);

    act(() => {
      result.current.setIsCreateRoleModalOpen(false);
    });

    expect(result.current.isCreateRoleModalOpen).toBe(false);
  });

  it("should clear search term", async () => {
    const { result } = renderHook(() => useAdminUsers());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    act(() => {
      result.current.setSearchTerm("doctor");
    });

    expect(result.current.filteredUsers).toHaveLength(1);

    act(() => {
      result.current.setSearchTerm("");
    });

    expect(result.current.filteredUsers).toHaveLength(mockUsers.length);
  });
});
