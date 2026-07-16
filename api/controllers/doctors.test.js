// Mock modules BEFORE any imports to prevent initialization errors
jest.mock("../supabase.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("../services/doctors.js");
jest.mock("../services/sseService.js");
jest.mock("../utils/logger.js");

import { DoctorsController } from "./doctors.js";
import * as DoctorsServiceModule from "../services/doctors.js";
import * as sseServiceModule from "../services/sseService.js";
import * as loggerModule from "../utils/logger.js";

describe("DoctorsController", () => {
  let mockReq;
  let mockRes;
  let mockNext;

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

    mockNext = jest.fn();

    // Setup DoctorsService mock
    DoctorsServiceModule.DoctorsService = {
      getAllDoctors: jest.fn(),
      getDoctorById: jest.fn(),
      createDoctor: jest.fn(),
      updateDoctor: jest.fn(),
      deleteDoctor: jest.fn(),
      getDoctorTimeOffConflicts: jest.fn(),
      getTimeOffs: jest.fn(),
      createDoctorTimeOff: jest.fn(),
    };

    // Setup error classes mock
    DoctorsServiceModule.DoctorTimeOffValidationError = class DoctorTimeOffValidationError extends (
      Error
    ) {};
    DoctorsServiceModule.DoctorTimeOffConflictError = class DoctorTimeOffConflictError extends (
      Error
    ) {
      constructor(message, count, appointments) {
        super(message);
        this.count = count;
        this.appointments = appointments;
      }
    };

    // Setup sseService mock
    sseServiceModule.sseService = {
      broadcast: jest.fn(),
    };

    // Setup logger mock
    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("getAllDoctors", () => {
    it("should return all doctors with success status", async () => {
      const mockDoctors = [
        {
          id: 1,
          last_name: "Smith",
          first_name: "Dr. John",
          department_id: 1,
        },
        {
          id: 2,
          last_name: "Johnson",
          first_name: "Dr. Jane",
          department_id: 2,
        },
      ];

      DoctorsServiceModule.DoctorsService.getAllDoctors.mockResolvedValue(mockDoctors);

      await DoctorsController.getAllDoctors(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDoctors,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all doctors", {
        count: 2,
      });
    });

    it("should handle error when fetching doctors", async () => {
      const error = new Error("Database connection error");
      DoctorsServiceModule.DoctorsService.getAllDoctors.mockRejectedValue(error);

      await DoctorsController.getAllDoctors(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching doctors", {
        message: "Database connection error",
      });
    });
  });

  describe("getDoctorById", () => {
    it("should return a doctor by ID", async () => {
      const mockDoctor = {
        id: 1,
        last_name: "Smith",
        first_name: "Dr. John",
        department_id: 1,
      };

      mockReq.params = { id: "1" };
      DoctorsServiceModule.DoctorsService.getDoctorById.mockResolvedValue(mockDoctor);

      await DoctorsController.getDoctorById(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.getDoctorById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDoctor,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched doctor", {
        id: "1",
      });
    });

    it("should return 404 when doctor is not found", async () => {
      mockReq.params = { id: "999" };
      DoctorsServiceModule.DoctorsService.getDoctorById.mockResolvedValue(null);

      await DoctorsController.getDoctorById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Doctor not found",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith("Doctor not found", {
        id: "999",
      });
    });

    it("should handle error when fetching doctor", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      DoctorsServiceModule.DoctorsService.getDoctorById.mockRejectedValue(error);

      await DoctorsController.getDoctorById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("createDoctor", () => {
    it("should create a new doctor with required fields", async () => {
      const newDoctorData = {
        user_id: 1,
        last_name: "Smith",
        first_name: "Dr. John",
        middle_name: "Michael",
        department_id: 1,
        room_id: 5,
        slot_duration_override: 30,
        is_active: true,
      };

      const createdDoctor = { id: 1, ...newDoctorData };

      mockReq.body = newDoctorData;
      DoctorsServiceModule.DoctorsService.createDoctor.mockResolvedValue(createdDoctor);

      await DoctorsController.createDoctor(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.createDoctor).toHaveBeenCalledWith(newDoctorData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdDoctor,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Doctor created", {
        id: 1,
        last_name: "Smith",
      });
    });

    it("should return 400 when last_name is missing", async () => {
      mockReq.body = {
        first_name: "Dr. John",
        department_id: 1,
      };

      await DoctorsController.createDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "last_name and first_name are required",
      });
    });

    it("should return 400 when first_name is missing", async () => {
      mockReq.body = {
        last_name: "Smith",
        department_id: 1,
      };

      await DoctorsController.createDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "last_name and first_name are required",
      });
    });

    it("should handle error when creating doctor", async () => {
      const error = new Error("Department not found");
      mockReq.body = {
        last_name: "Smith",
        first_name: "Dr. John",
        department_id: 999,
      };

      DoctorsServiceModule.DoctorsService.createDoctor.mockRejectedValue(error);

      await DoctorsController.createDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Department not found",
      });
    });
  });

  describe("updateDoctor", () => {
    it("should update an existing doctor", async () => {
      const updateData = {
        department_id: 2,
        is_active: false,
      };

      const updatedDoctor = {
        id: 1,
        last_name: "Smith",
        first_name: "Dr. John",
        ...updateData,
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      DoctorsServiceModule.DoctorsService.updateDoctor.mockResolvedValue(updatedDoctor);

      await DoctorsController.updateDoctor(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.updateDoctor).toHaveBeenCalledWith(1, updateData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedDoctor,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Doctor updated", {
        id: "1",
        last_name: "Smith",
      });
    });

    it("should return 400 when no valid fields are provided", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        undefined_field: "value",
      };

      await DoctorsController.updateDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Provide at least one field to update: user_id, last_name, first_name, middle_name, department_id, room_id, slot_duration_override, is_active",
      });
    });

    it("should filter out undefined fields", async () => {
      const updateData = {
        department_id: 2,
        is_active: undefined,
        last_name: "NewSmith",
      };

      const filteredData = {
        department_id: 2,
        last_name: "NewSmith",
      };

      const updatedDoctor = {
        id: 1,
        ...filteredData,
        first_name: "Dr. John",
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      DoctorsServiceModule.DoctorsService.updateDoctor.mockResolvedValue(updatedDoctor);

      await DoctorsController.updateDoctor(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.updateDoctor).toHaveBeenCalledWith(
        1,
        filteredData,
      );
    });

    it("should return 404 when doctor is not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { department_id: 2 };
      DoctorsServiceModule.DoctorsService.updateDoctor.mockResolvedValue(null);

      await DoctorsController.updateDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Doctor not found",
      });
    });

    it("should handle error when updating doctor", async () => {
      const error = new Error("Validation error");
      mockReq.params = { id: "1" };
      mockReq.body = { department_id: 2 };
      DoctorsServiceModule.DoctorsService.updateDoctor.mockRejectedValue(error);

      await DoctorsController.updateDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation error",
      });
    });
  });

  describe("deleteDoctor", () => {
    it("should delete an existing doctor", async () => {
      const deletedDoctor = {
        id: 1,
        last_name: "Smith",
        first_name: "Dr. John",
        department_id: 1,
      };

      mockReq.params = { id: "1" };
      DoctorsServiceModule.DoctorsService.deleteDoctor.mockResolvedValue(deletedDoctor);

      await DoctorsController.deleteDoctor(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.deleteDoctor).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: deletedDoctor,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Doctor deleted", {
        id: "1",
        last_name: "Smith",
      });
    });

    it("should return 404 when doctor is not found", async () => {
      mockReq.params = { id: "999" };
      DoctorsServiceModule.DoctorsService.deleteDoctor.mockResolvedValue(null);

      await DoctorsController.deleteDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Doctor not found",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith("Doctor not found for deletion", {
        id: "999",
      });
    });

    it("should handle error when deleting doctor", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      DoctorsServiceModule.DoctorsService.deleteDoctor.mockRejectedValue(error);

      await DoctorsController.deleteDoctor(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("getDoctorTimeOffConflicts", () => {
    it("should return time-off conflicts for a doctor", async () => {
      const mockResult = {
        startDate: "2024-08-01",
        endDate: "2024-08-15",
        count: 2,
        appointments: [
          { id: 1, appointment_date: "2024-08-05" },
          { id: 2, appointment_date: "2024-08-10" },
        ],
      };

      mockReq.params = { id: "1" };
      mockReq.query = { start_date: "2024-08-01", end_date: "2024-08-15" };
      DoctorsServiceModule.DoctorsService.getDoctorTimeOffConflicts.mockResolvedValue(mockResult);

      await DoctorsController.getDoctorTimeOffConflicts(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.getDoctorTimeOffConflicts).toHaveBeenCalledWith(
        1,
        "2024-08-01",
        "2024-08-15",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          count: 2,
          appointments: mockResult.appointments,
        },
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched doctor time-off conflicts", {
        doctor_id: 1,
        start_date: "2024-08-01",
        end_date: "2024-08-15",
        count: 2,
      });
    });

    it("should return 400 for validation error", async () => {
      const error = new DoctorsServiceModule.DoctorTimeOffValidationError("Invalid date format");
      mockReq.params = { id: "1" };
      mockReq.query = { start_date: "invalid", end_date: "invalid" };
      DoctorsServiceModule.DoctorsService.getDoctorTimeOffConflicts.mockRejectedValue(error);

      await DoctorsController.getDoctorTimeOffConflicts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid date format",
      });
    });

    it("should handle generic error", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      mockReq.query = { start_date: "2024-08-01", end_date: "2024-08-15" };
      DoctorsServiceModule.DoctorsService.getDoctorTimeOffConflicts.mockRejectedValue(error);

      await DoctorsController.getDoctorTimeOffConflicts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("getTimeOffs", () => {
    it("should return time-offs for doctors", async () => {
      const mockTimeOffs = [
        { id: 1, doctor_id: 1, start_date: "2024-08-01", end_date: "2024-08-05" },
        { id: 2, doctor_id: 2, start_date: "2024-08-10", end_date: "2024-08-15" },
      ];

      mockReq.query = { date: "2024-08-01", doctorIds: "1,2" };
      DoctorsServiceModule.DoctorsService.getTimeOffs.mockResolvedValue(mockTimeOffs);

      await DoctorsController.getTimeOffs(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.getTimeOffs).toHaveBeenCalledWith({
        date: "2024-08-01",
        doctorIds: "1,2",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTimeOffs,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched doctor time offs", {
        date: "2024-08-01",
        count: 2,
      });
    });

    it("should return 400 for validation error", async () => {
      const error = new DoctorsServiceModule.DoctorTimeOffValidationError("Invalid date format");
      mockReq.query = { date: "invalid" };
      DoctorsServiceModule.DoctorsService.getTimeOffs.mockRejectedValue(error);

      await DoctorsController.getTimeOffs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid date format",
      });
    });

    it("should handle generic error", async () => {
      const error = new Error("Database error");
      mockReq.query = { date: "2024-08-01" };
      DoctorsServiceModule.DoctorsService.getTimeOffs.mockRejectedValue(error);

      await DoctorsController.getTimeOffs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("createDoctorTimeOff", () => {
    it("should create a doctor time-off", async () => {
      const timeOffData = {
        start_date: "2024-08-01",
        end_date: "2024-08-05",
        reason: "Vacation",
      };

      const createdTimeOff = {
        id: 1,
        doctor_id: 1,
        ...timeOffData,
      };

      mockReq.params = { id: "1" };
      mockReq.body = timeOffData;
      DoctorsServiceModule.DoctorsService.createDoctorTimeOff.mockResolvedValue(createdTimeOff);

      await DoctorsController.createDoctorTimeOff(mockReq, mockRes);

      expect(DoctorsServiceModule.DoctorsService.createDoctorTimeOff).toHaveBeenCalledWith({
        doctorId: 1,
        startDate: "2024-08-01",
        endDate: "2024-08-05",
        reason: "Vacation",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdTimeOff,
      });
      expect(sseServiceModule.sseService.broadcast).toHaveBeenCalledWith(
        "TIME_OFF_CREATED",
        createdTimeOff,
      );
      expect(loggerModule.default.info).toHaveBeenCalledWith("Doctor time off created", {
        doctor_id: 1,
        time_off_id: 1,
      });
    });

    it("should return 400 for validation error", async () => {
      const error = new DoctorsServiceModule.DoctorTimeOffValidationError("Invalid date range");
      mockReq.params = { id: "1" };
      mockReq.body = {
        start_date: "invalid",
        end_date: "invalid",
        reason: "Vacation",
      };
      DoctorsServiceModule.DoctorsService.createDoctorTimeOff.mockRejectedValue(error);

      await DoctorsController.createDoctorTimeOff(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid date range",
      });
      expect(sseServiceModule.sseService.broadcast).not.toHaveBeenCalled();
    });

    it("should return 409 for conflict error", async () => {
      const appointments = [
        { id: 1, appointment_date: "2024-08-05" },
        { id: 2, appointment_date: "2024-08-10" },
      ];
      const error = new DoctorsServiceModule.DoctorTimeOffConflictError(
        "Time-off conflicts with appointments",
        2,
        appointments,
      );
      mockReq.params = { id: "1" };
      mockReq.body = {
        start_date: "2024-08-01",
        end_date: "2024-08-15",
        reason: "Vacation",
      };
      DoctorsServiceModule.DoctorsService.createDoctorTimeOff.mockRejectedValue(error);

      await DoctorsController.createDoctorTimeOff(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Time-off conflicts with appointments",
        count: 2,
        appointments,
      });
      expect(sseServiceModule.sseService.broadcast).not.toHaveBeenCalled();
    });

    it("should handle generic error", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      mockReq.body = {
        start_date: "2024-08-01",
        end_date: "2024-08-05",
        reason: "Vacation",
      };
      DoctorsServiceModule.DoctorsService.createDoctorTimeOff.mockRejectedValue(error);

      await DoctorsController.createDoctorTimeOff(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });
});
