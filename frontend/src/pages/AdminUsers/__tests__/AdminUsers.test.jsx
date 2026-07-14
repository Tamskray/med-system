import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminUsers from "../index";
import { useAdminUsers } from "../useAdminUsers";
import { ROLE_IDS } from "../../../constants/roles";

jest.mock("../useAdminUsers", () => ({
  useAdminUsers: jest.fn(),
}));

jest.mock("../CreateRoleModal", () => {
  return function MockCreateRoleModal() {
    return <div data-testid="create-role-modal">Create Role Modal</div>;
  };
});

jest.mock("../../../components/core/SearchInput", () => {
  return function MockSearchInput({ value, onChange, placeholder }) {
    return (
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e)}
        placeholder={placeholder}
      />
    );
  };
});

jest.mock("../../../components/core/Modal", () => {
  return function MockModal({ open, title, children, onSubmit, submitDisabled }) {
    return open ? (
      <div data-testid="create-user-modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onSubmit} disabled={submitDisabled}>
          Створити
        </button>
      </div>
    ) : null;
  };
});

jest.mock("../../../components/core/Table", () => {
  return function MockTable({ data, isLoading, emptyText }) {
    return (
      <div data-testid="users-table">
        {isLoading && <div>Loading...</div>}
        {!isLoading && data.length === 0 && <div>{emptyText}</div>}
        {data.length > 0 && (
          <table>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
});

const mockUsers = [
  {
    id: 1,
    username: "receptionist",
    email: "receptionist@example.com",
    role_id: ROLE_IDS.RECEPTIONIST,
    is_active: true,
  },
];

const mockRoles = [
  { id: ROLE_IDS.RECEPTIONIST, name: "Receptionist" },
  { id: ROLE_IDS.DOCTOR, name: "Doctor" },
];

const defaultHookValue = {
  access: { isSuperAdmin: true, create: true, update: true, delete: true },
  filteredUsers: mockUsers,
  searchTerm: "",
  isLoadingUsers: false,
  roles: mockRoles,
  isLoadingRoles: false,
  modules: [],
  isLoadingModules: false,
  form: {
    username: "",
    email: "",
    password: "",
    role_id: "",
    is_active: true,
    doctor_id: "",
  },
  formErrors: {},
  isSubmitting: false,
  isDoctoRoleSelected: false,
  isCreateModalOpen: false,
  isCreateRoleModalOpen: false,
  doctorsWithoutAccount: [],
  isLoadingDoctors: false,
  columns: [],
  setSearchTerm: jest.fn(),
  setIsCreateRoleModalOpen: jest.fn(),
  handleChange: jest.fn(() => jest.fn()),
  openCreateModal: jest.fn(),
  closeCreateModal: jest.fn(),
  handleSubmit: jest.fn(),
  loadRoles: jest.fn(),
};

describe("AdminUsers Component", () => {
  beforeEach(() => {
    useAdminUsers.mockReturnValue(defaultHookValue);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render AdminUsers component", () => {
    render(<AdminUsers />);
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("should display search input", () => {
    render(<AdminUsers />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should call setSearchTerm on search input change", () => {
    const mockSetSearchTerm = jest.fn();
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      setSearchTerm: mockSetSearchTerm,
    });

    render(<AdminUsers />);
    const searchInput = screen.getByTestId("search-input");

    fireEvent.change(searchInput, { target: { value: "admin" } });

    expect(mockSetSearchTerm).toHaveBeenCalled();
  });

  it("should show create user button for users with create permission", () => {
    render(<AdminUsers />);
    expect(screen.getByRole("button", { name: /Створити користувача/i })).toBeInTheDocument();
  });

  it("should show create role button for super admin", () => {
    render(<AdminUsers />);
    expect(screen.getByRole("button", { name: /Створити роль/i })).toBeInTheDocument();
  });

  it("should not show create role button for non-super admin", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      access: { ...defaultHookValue.access, isSuperAdmin: false },
    });

    render(<AdminUsers />);
    expect(screen.queryByRole("button", { name: /Створити роль/i })).not.toBeInTheDocument();
  });

  it("should call openCreateModal on create button click", () => {
    const mockOpenCreateModal = jest.fn();
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      openCreateModal: mockOpenCreateModal,
    });

    render(<AdminUsers />);
    const createButton = screen.getByRole("button", { name: /Створити користувача/i });

    fireEvent.click(createButton);

    expect(mockOpenCreateModal).toHaveBeenCalled();
  });

  it("should render create user modal when open", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
    });

    render(<AdminUsers />);
    expect(screen.getByTestId("create-user-modal")).toBeInTheDocument();
    expect(screen.getByText("Створення нового користувача")).toBeInTheDocument();
  });

  it("should not render create user modal when closed", () => {
    render(<AdminUsers />);
    expect(screen.queryByTestId("create-user-modal")).not.toBeInTheDocument();
  });

  it("should pass users data to Table component", () => {
    render(<AdminUsers />);
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("should show loading state in table", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isLoadingUsers: true,
    });

    render(<AdminUsers />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show empty text when no users", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      filteredUsers: [],
    });

    render(<AdminUsers />);
    expect(screen.getByText("Користувачів ще немає")).toBeInTheDocument();
  });

  it("should render create role modal", () => {
    render(<AdminUsers />);
    expect(screen.getByTestId("create-role-modal")).toBeInTheDocument();
  });

  it("should call setIsCreateRoleModalOpen when create role button clicked", () => {
    const mockSetIsCreateRoleModalOpen = jest.fn();
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      setIsCreateRoleModalOpen: mockSetIsCreateRoleModalOpen,
    });

    render(<AdminUsers />);
    const createRoleButton = screen.getByRole("button", { name: /Створити роль/i });

    fireEvent.click(createRoleButton);

    expect(mockSetIsCreateRoleModalOpen).toHaveBeenCalledWith(true);
  });

  it("should show doctor selection when Doctor role is selected", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
      isDoctoRoleSelected: true,
    });

    render(<AdminUsers />);
    const formControls = screen.getAllByLabelText("Лікар");
    expect(formControls.length).toBeGreaterThan(0);
  });

  it("should not show doctor selection when Doctor role is not selected", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
      isDoctoRoleSelected: false,
    });

    render(<AdminUsers />);
    const formControls = screen.queryAllByLabelText("Лікар");
    expect(formControls.length).toBe(0);
  });

  it("should show form errors in modal", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
      formErrors: { username: "Введіть username" },
    });

    render(<AdminUsers />);
    expect(screen.getByText("Введіть username")).toBeInTheDocument();
  });

  it("should disable create button when submitting", () => {
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
      isSubmitting: true,
    });

    render(<AdminUsers />);
    const submitButtons = screen.getAllByRole("button", { name: /Створити/i });
    const submitButtonInModal = submitButtons.find((btn) => btn.textContent.trim() === "Створити");
    expect(submitButtonInModal).toBeDisabled();
  });

  it("should call handleSubmit on form submit", () => {
    const mockHandleSubmit = jest.fn();
    useAdminUsers.mockReturnValue({
      ...defaultHookValue,
      isCreateModalOpen: true,
      handleSubmit: mockHandleSubmit,
    });

    render(<AdminUsers />);
    const submitButtons = screen.getAllByRole("button", { name: /Створити/i });
    const submitButtonInModal = submitButtons.find((btn) => btn.textContent.trim() === "Створити");

    fireEvent.click(submitButtonInModal);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
