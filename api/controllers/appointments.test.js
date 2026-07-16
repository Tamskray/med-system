// Mock modules BEFORE any imports to prevent initialization errors
jest.mock("../supabase.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("../services/appointments.js");
jest.mock("../services/sseService.js");
jest.mock("../utils/logger.js");

import { AppointmentsController } from "./appointments.js";
import * as AppointmentsServiceModule from "../services/appointments.js";
import * as sseServiceModule from "../services/sseService.js";
import * as supabaseModule from "../supabase.js";
import * as loggerModule from "../utils/logger.js";

describe("AppointmentsController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      params: {},
      body: {},
      query: {},
    };

    // Setup mock response with chainable methods
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Setup AppointmentsService mock
    AppointmentsServiceModule.AppointmentsService = {
      getAllAppointments: jest.fn(),
      createAppointment: jest.fn(),
      updateAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    };

    // Setup error class mock
    AppointmentsServiceModule.AppointmentValidationError = class AppointmentValidationError extends (
      Error
    ) {};

    // Setup sseService mock
    sseServiceModule.sseService = {
      addClient: jest.fn(),
      broadcast: jest.fn(),
    };

    // Setup logger mock
    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("streamAppointments", () => {
    it("should add client to SSE service", () => {
      AppointmentsController.streamAppointments(mockReq, mockRes);

      expect(sseServiceModule.sseService.addClient).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });

  describe("getAllAppointments", () => {
    it("should return all appointments without filters", async () => {
      const mockAppointments = [
        {
          id: 1,
          doctor_id: 1,
          patient_id: 1,
          appointment_date: "2024-08-15",
          start_time: "09:00",
          end_time: "09:30",
        },
        {
          id: 2,
          doctor_id: 2,
          patient_id: 2,
          appointment_date: "2024-08-15",
          start_time: "10:00",
          end_time: "10:30",
        },
      ];

      AppointmentsServiceModule.AppointmentsService.getAllAppointments.mockResolvedValue(
        mockAppointments,
      );

      await AppointmentsController.getAllAppointments(mockReq, mockRes);

      expect(AppointmentsServiceModule.AppointmentsService.getAllAppointments).toHaveBeenCalledWith(
        {
          date: undefined,
          doctorId: undefined,
          patientId: undefined,
        },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched appointments", {
        count: 2,
        date: null,
        doctor_id: null,
        patient_id: null,
      });
    });

    it("should return appointments filtered by date", async () => {
      const mockAppointments = [
        {
          id: 1,
          doctor_id: 1,
          appointment_date: "2024-08-15",
        },
      ];

      mockReq.query = { date: "2024-08-15" };
      AppointmentsServiceModule.AppointmentsService.getAllAppointments.mockResolvedValue(
        mockAppointments,
      );

      await AppointmentsController.getAllAppointments(mockReq, mockRes);

      expect(AppointmentsServiceModule.AppointmentsService.getAllAppointments).toHaveBeenCalledWith(
        {
          date: "2024-08-15",
          doctorId: undefined,
          patientId: undefined,
        },
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
      });
    });

    it("should return appointments filtered by doctor_id and patient_id", async () => {
      const mockAppointments = [
        {
          id: 1,
          doctor_id: 1,
          patient_id: 5,
          appointment_date: "2024-08-15",
        },
      ];

      mockReq.query = { doctor_id: "1", patient_id: "5" };
      AppointmentsServiceModule.AppointmentsService.getAllAppointments.mockResolvedValue(
        mockAppointments,
      );

      await AppointmentsController.getAllAppointments(mockReq, mockRes);

      expect(AppointmentsServiceModule.AppointmentsService.getAllAppointments).toHaveBeenCalledWith(
        {
          date: undefined,
          doctorId: "1",
          patientId: "5",
        },
      );
    });

    it("should handle error when fetching appointments", async () => {
      const error = new Error("Database connection error");
      AppointmentsServiceModule.AppointmentsService.getAllAppointments.mockRejectedValue(error);

      await AppointmentsController.getAllAppointments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching appointments", {
        message: "Database connection error",
      });
    });
  });

  describe("createAppointment", () => {
    it("should create a new appointment with required fields", async () => {
      const newAppointmentData = {
        doctor_id: 1,
        patient_id: 5,
        appointment_date: "2024-08-15",
        start_time: "09:00",
        end_time: "09:30",
        appointment_type: "consultation",
        status: "scheduled",
        notes: "Regular checkup",
      };

      const createdAppointment = { id: 1, ...newAppointmentData };

      mockReq.body = newAppointmentData;
      AppointmentsServiceModule.AppointmentsService.createAppointment.mockResolvedValue(
        createdAppointment,
      );

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(AppointmentsServiceModule.AppointmentsService.createAppointment).toHaveBeenCalledWith(
        newAppointmentData,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdAppointment,
      });
      expect(sseServiceModule.sseService.broadcast).toHaveBeenCalledWith(
        "CREATE",
        createdAppointment,
      );
      expect(loggerModule.default.info).toHaveBeenCalledWith("Appointment created", {
        id: 1,
        doctor_id: 1,
        appointment_date: "2024-08-15",
      });
    });

    it("should return 400 when doctor_id is missing", async () => {
      mockReq.body = {
        patient_id: 5,
        appointment_date: "2024-08-15",
        start_time: "09:00",
        end_time: "09:30",
      };

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "doctor_id, appointment_date, start_time, and end_time are required",
      });
    });

    it("should return 400 when appointment_date is missing", async () => {
      mockReq.body = {
        doctor_id: 1,
        start_time: "09:00",
        end_time: "09:30",
      };

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "doctor_id, appointment_date, start_time, and end_time are required",
      });
    });

    it("should return 400 when start_time is missing", async () => {
      mockReq.body = {
        doctor_id: 1,
        appointment_date: "2024-08-15",
        end_time: "09:30",
      };

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when end_time is missing", async () => {
      mockReq.body = {
        doctor_id: 1,
        appointment_date: "2024-08-15",
        start_time: "09:00",
      };

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for AppointmentValidationError", async () => {
      const error = new AppointmentsServiceModule.AppointmentValidationError(
        "Doctor is not available at this time",
      );
      mockReq.body = {
        doctor_id: 1,
        appointment_date: "2024-08-15",
        start_time: "09:00",
        end_time: "09:30",
      };
      AppointmentsServiceModule.AppointmentsService.createAppointment.mockRejectedValue(error);

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Doctor is not available at this time",
      });
    });

    it("should handle generic error when creating appointment", async () => {
      const error = new Error("Database error");
      mockReq.body = {
        doctor_id: 1,
        appointment_date: "2024-08-15",
        start_time: "09:00",
        end_time: "09:30",
      };
      AppointmentsServiceModule.AppointmentsService.createAppointment.mockRejectedValue(error);

      await AppointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("updateAppointment", () => {
    it("should update appointment status", async () => {
      const updateData = {
        status: "completed",
      };

      const updatedAppointment = {
        id: 1,
        doctor_id: 1,
        status: "completed",
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      AppointmentsServiceModule.AppointmentsService.updateAppointment.mockResolvedValue(
        updatedAppointment,
      );

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(AppointmentsServiceModule.AppointmentsService.updateAppointment).toHaveBeenCalledWith(
        1,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAppointment,
      });
      expect(sseServiceModule.sseService.broadcast).toHaveBeenCalledWith(
        "UPDATE_STATUS",
        updatedAppointment,
      );
      expect(loggerModule.default.info).toHaveBeenCalledWith("Appointment updated", {
        id: "1",
        status: "completed",
      });
    });

    it("should update appointment without broadcasting for non-status updates", async () => {
      const updateData = {
        notes: "Updated notes",
      };

      const updatedAppointment = {
        id: 1,
        notes: "Updated notes",
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      AppointmentsServiceModule.AppointmentsService.updateAppointment.mockResolvedValue(
        updatedAppointment,
      );

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAppointment,
      });
      expect(sseServiceModule.sseService.broadcast).not.toHaveBeenCalled();
    });

    it("should return 400 when no valid fields are provided", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        invalid_field: "value",
      };

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Provide at least one field to update: patient_id, appointment_date, start_time, end_time, appointment_type, status, cancellation_reason, notes",
      });
    });

    it("should return 404 when appointment is not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { status: "completed" };
      AppointmentsServiceModule.AppointmentsService.updateAppointment.mockResolvedValue(null);

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Appointment not found",
      });
    });

    it("should return 400 for AppointmentValidationError", async () => {
      const error = new AppointmentsServiceModule.AppointmentValidationError(
        "Cannot update completed appointment",
      );
      mockReq.params = { id: "1" };
      mockReq.body = { status: "scheduled" };
      AppointmentsServiceModule.AppointmentsService.updateAppointment.mockRejectedValue(error);

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Cannot update completed appointment",
      });
    });

    it("should handle generic error when updating appointment", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      mockReq.body = { status: "completed" };
      AppointmentsServiceModule.AppointmentsService.updateAppointment.mockRejectedValue(error);

      await AppointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("deleteAppointment", () => {
    it("should delete an existing appointment", async () => {
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      supabaseModule.supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      AppointmentsServiceModule.AppointmentsService.deleteAppointment.mockResolvedValue(undefined);

      mockReq.params = { id: "1" };

      await AppointmentsController.deleteAppointment(mockReq, mockRes);

      expect(supabaseModule.supabase.from).toHaveBeenCalledWith("appointments");
      expect(mockSelectChain.eq).toHaveBeenCalledWith("id", "1");
      expect(AppointmentsServiceModule.AppointmentsService.deleteAppointment).toHaveBeenCalledWith(
        1,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Appointment deleted",
      });
      expect(sseServiceModule.sseService.broadcast).toHaveBeenCalledWith("DELETE", {
        id: 1,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Appointment deleted", {
        id: "1",
      });
    });

    it("should return 404 when appointment is not found", async () => {
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: "NOT_FOUND",
        }),
      };

      supabaseModule.supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      mockReq.params = { id: "999" };

      await AppointmentsController.deleteAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Appointment not found",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith("Appointment not found for deletion", {
        id: "999",
      });
      expect(
        AppointmentsServiceModule.AppointmentsService.deleteAppointment,
      ).not.toHaveBeenCalled();
    });

    it("should handle error when deleting appointment", async () => {
      const error = new Error("Database error");
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      supabaseModule.supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      AppointmentsServiceModule.AppointmentsService.deleteAppointment.mockRejectedValue(error);

      mockReq.params = { id: "1" };

      await AppointmentsController.deleteAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error deleting appointment", {
        id: "1",
        message: "Database error",
      });
    });
  });
});
