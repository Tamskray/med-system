import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import PatientsForm from "../";
import { PATIENT_FORM_MODES } from "../../constants";

describe("PatientsForm UI Component", () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly in CREATE mode", () => {
    render(
      <PatientsForm
        open={true}
        mode={PATIENT_FORM_MODES.CREATE}
        isLoading={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("Додати пацієнта")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Додати" })).toBeInTheDocument();
  });

  it("renders correctly in EDIT mode with initial values", () => {
    const editData = {
      id: 1,
      last_name: "Шевченко",
      first_name: "Тарас",
      phone: "+38 050 123 45 67",
    };

    render(
      <PatientsForm
        open={true}
        mode={PATIENT_FORM_MODES.EDIT}
        initialValues={editData}
        isLoading={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText("Редагувати пацієнта")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Зберегти" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Шевченко")).toBeInTheDocument();
  });

  it("displays validation errors when submitting empty required fields", async () => {
    const user = userEvent.setup();

    render(
      <PatientsForm
        open={true}
        mode={PATIENT_FORM_MODES.CREATE}
        isLoading={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Додати" });
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Прізвище обов'язкове")).toBeInTheDocument();
    expect(await screen.findByText("Ім'я обов'язкове")).toBeInTheDocument();
    expect(await screen.findByText("Введіть повну дату у форматі ДД.ММ.РРРР")).toBeInTheDocument();
  });
});
