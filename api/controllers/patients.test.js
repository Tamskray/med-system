import { PatientsController } from "./patients.js";
import * as PatientsServiceModule from "../services/patients.js";
import * as loggerModule from "../utils/logger.js";

// Mock the dependencies
jest.mock("../services/patients.js");
jest.mock("../utils/logger.js");

describe("PatientsController", () => {
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

    // Setup logger mock
    PatientsServiceModule.PatientsService = {
      getAllPatients: jest.fn(),
      getPatientById: jest.fn(),
      createPatient: jest.fn(),
      updatePatient: jest.fn(),
      deletePatient: jest.fn(),
    };

    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("getAllPatients", () => {
    it("should return all patients with success status", async () => {
      const mockPatients = [
        {
          id: 1,
          last_name: "Doe",
          first_name: "John",
          email: "john@example.com",
        },
        {
          id: 2,
          last_name: "Smith",
          first_name: "Jane",
          email: "jane@example.com",
        },
      ];

      PatientsServiceModule.PatientsService.getAllPatients.mockResolvedValue(mockPatients);

      await PatientsController.getAllPatients(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPatients,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all patients", { count: 2 });
    });

    it("should handle error when fetching patients", async () => {
      const error = new Error("Database connection error");
      PatientsServiceModule.PatientsService.getAllPatients.mockRejectedValue(error);

      await PatientsController.getAllPatients(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching patients", {
        message: "Database connection error",
      });
    });
  });

  describe("getPatientById", () => {
    it("should return a patient by ID", async () => {
      const mockPatient = {
        id: 1,
        last_name: "Doe",
        first_name: "John",
        email: "john@example.com",
      };

      mockReq.params = { id: "1" };
      PatientsServiceModule.PatientsService.getPatientById.mockResolvedValue(mockPatient);

      await PatientsController.getPatientById(mockReq, mockRes);

      expect(PatientsServiceModule.PatientsService.getPatientById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPatient,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched patient", { id: "1" });
    });

    it("should return 404 when patient is not found", async () => {
      mockReq.params = { id: "999" };
      PatientsServiceModule.PatientsService.getPatientById.mockResolvedValue(null);

      await PatientsController.getPatientById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Patient not found",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith("Patient not found", { id: "999" });
    });

    it("should handle error when fetching patient", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      PatientsServiceModule.PatientsService.getPatientById.mockRejectedValue(error);

      await PatientsController.getPatientById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("createPatient", () => {
    it("should create a new patient with required fields", async () => {
      const newPatientData = {
        last_name: "Doe",
        first_name: "John",
        middle_name: "Michael",
        gender: "M",
        date_of_birth: "1990-01-15",
        phone: "+1234567890",
        email: "john@example.com",
      };

      const createdPatient = { id: 1, ...newPatientData };

      mockReq.body = newPatientData;
      PatientsServiceModule.PatientsService.createPatient.mockResolvedValue(createdPatient);

      await PatientsController.createPatient(mockReq, mockRes);

      expect(PatientsServiceModule.PatientsService.createPatient).toHaveBeenCalledWith(
        newPatientData,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdPatient,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Patient created", {
        id: 1,
        last_name: "Doe",
      });
    });

    it("should return 400 when last_name is missing", async () => {
      mockReq.body = {
        first_name: "John",
        email: "john@example.com",
      };

      await PatientsController.createPatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "last_name and first_name are required",
      });
    });

    it("should return 400 when first_name is missing", async () => {
      mockReq.body = {
        last_name: "Doe",
        email: "john@example.com",
      };

      await PatientsController.createPatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "last_name and first_name are required",
      });
    });

    it("should handle error when creating patient", async () => {
      const error = new Error("Email already exists");
      mockReq.body = {
        last_name: "Doe",
        first_name: "John",
        email: "john@example.com",
      };

      PatientsServiceModule.PatientsService.createPatient.mockRejectedValue(error);

      await PatientsController.createPatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists",
      });
    });
  });

  describe("updatePatient", () => {
    it("should update an existing patient", async () => {
      const updateData = {
        phone: "+9876543210",
        email: "newemail@example.com",
      };

      const updatedPatient = {
        id: 1,
        last_name: "Doe",
        first_name: "John",
        ...updateData,
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      PatientsServiceModule.PatientsService.updatePatient.mockResolvedValue(updatedPatient);

      await PatientsController.updatePatient(mockReq, mockRes);

      expect(PatientsServiceModule.PatientsService.updatePatient).toHaveBeenCalledWith(
        1,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPatient,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Patient updated", {
        id: "1",
        last_name: "Doe",
      });
    });

    it("should return 400 when no valid fields are provided", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        undefined_field: "value",
      };

      await PatientsController.updatePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Provide at least one field to update: last_name, first_name, middle_name, gender, date_of_birth, phone, email",
      });
    });

    it("should filter out undefined fields", async () => {
      const updateData = {
        phone: "+9876543210",
        email: undefined,
        last_name: "NewDoe",
      };

      const filteredData = {
        phone: "+9876543210",
        last_name: "NewDoe",
      };

      const updatedPatient = {
        id: 1,
        ...filteredData,
        first_name: "John",
      };

      mockReq.params = { id: "1" };
      mockReq.body = updateData;
      PatientsServiceModule.PatientsService.updatePatient.mockResolvedValue(updatedPatient);

      await PatientsController.updatePatient(mockReq, mockRes);

      expect(PatientsServiceModule.PatientsService.updatePatient).toHaveBeenCalledWith(
        1,
        filteredData,
      );
    });

    it("should return 404 when patient is not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { phone: "+9876543210" };
      PatientsServiceModule.PatientsService.updatePatient.mockResolvedValue(null);

      await PatientsController.updatePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Patient not found",
      });
    });

    it("should handle error when updating patient", async () => {
      const error = new Error("Validation error");
      mockReq.params = { id: "1" };
      mockReq.body = { phone: "+9876543210" };
      PatientsServiceModule.PatientsService.updatePatient.mockRejectedValue(error);

      await PatientsController.updatePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation error",
      });
    });
  });

  describe("deletePatient", () => {
    it("should delete an existing patient", async () => {
      const deletedPatient = {
        id: 1,
        last_name: "Doe",
        first_name: "John",
        email: "john@example.com",
      };

      mockReq.params = { id: "1" };
      PatientsServiceModule.PatientsService.deletePatient.mockResolvedValue(deletedPatient);

      await PatientsController.deletePatient(mockReq, mockRes);

      expect(PatientsServiceModule.PatientsService.deletePatient).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: deletedPatient,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Patient deleted", {
        id: "1",
        last_name: "Doe",
      });
    });

    it("should return 404 when patient is not found", async () => {
      mockReq.params = { id: "999" };
      PatientsServiceModule.PatientsService.deletePatient.mockResolvedValue(null);

      await PatientsController.deletePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Patient not found",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith("Patient not found for deletion", {
        id: "999",
      });
    });

    it("should handle error when deleting patient", async () => {
      const error = new Error("Database error");
      mockReq.params = { id: "1" };
      PatientsServiceModule.PatientsService.deletePatient.mockRejectedValue(error);

      await PatientsController.deletePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });
});
