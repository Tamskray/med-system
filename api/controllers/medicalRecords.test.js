// Mock modules BEFORE any imports to prevent initialization errors
jest.mock("../supabase.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("../services/medicalRecords.js");
jest.mock("../utils/logger.js");

import { MedicalRecordsController } from "./medicalRecords.js";
import * as MedicalRecordsServiceModule from "../services/medicalRecords.js";
import * as loggerModule from "../utils/logger.js";

describe("MedicalRecordsController", () => {
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

    // Setup MedicalRecordsService mock
    MedicalRecordsServiceModule.MedicalRecordsService = {
      getMedicalRecords: jest.fn(),
      createMedicalRecord: jest.fn(),
    };

    // Setup logger mock
    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("getMedicalRecords", () => {
    it("should return all medical records without filter", async () => {
      const mockRecords = [
        {
          id: 1,
          patient_id: 5,
          doctor_id: 1,
          diagnosis: "Hypertension",
          symptoms: "High blood pressure",
          created_at: "2024-08-01",
        },
        {
          id: 2,
          patient_id: 5,
          doctor_id: 2,
          diagnosis: "Diabetes",
          symptoms: "High blood sugar",
          created_at: "2024-08-15",
        },
      ];

      MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords.mockResolvedValue(
        mockRecords,
      );

      await MedicalRecordsController.getMedicalRecords(mockReq, mockRes);

      expect(
        MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords,
      ).toHaveBeenCalledWith({
        patientId: undefined,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecords,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched medical records", {
        count: 2,
        patient_id: null,
      });
    });

    it("should return medical records filtered by patient_id", async () => {
      const mockRecords = [
        {
          id: 1,
          patient_id: 5,
          doctor_id: 1,
          diagnosis: "Hypertension",
          symptoms: "High blood pressure",
          created_at: "2024-08-01",
        },
      ];

      mockReq.query = { patient_id: "5" };
      MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords.mockResolvedValue(
        mockRecords,
      );

      await MedicalRecordsController.getMedicalRecords(mockReq, mockRes);

      expect(
        MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords,
      ).toHaveBeenCalledWith({
        patientId: "5",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecords,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched medical records", {
        count: 1,
        patient_id: "5",
      });
    });

    it("should return empty array when no records exist", async () => {
      const mockRecords = [];

      mockReq.query = { patient_id: "999" };
      MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords.mockResolvedValue(
        mockRecords,
      );

      await MedicalRecordsController.getMedicalRecords(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched medical records", {
        count: 0,
        patient_id: "999",
      });
    });

    it("should handle error when fetching medical records", async () => {
      const error = new Error("Database connection error");
      MedicalRecordsServiceModule.MedicalRecordsService.getMedicalRecords.mockRejectedValue(error);

      await MedicalRecordsController.getMedicalRecords(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching medical records", {
        message: "Database connection error",
      });
    });
  });

  describe("createMedicalRecord", () => {
    it("should create a new medical record with required fields", async () => {
      const newRecordData = {
        patient_id: 5,
        doctor_id: 1,
        appointment_id: 10,
        symptoms: "Persistent cough",
        diagnosis: "Bronchitis",
        prescription_notes: "Antibiotics 3x daily",
        attachments: ["scan1.pdf"],
      };

      const createdRecord = {
        id: 1,
        ...newRecordData,
        created_at: "2024-08-20",
      };

      mockReq.body = newRecordData;
      MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord.mockResolvedValue(
        createdRecord,
      );

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(
        MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord,
      ).toHaveBeenCalledWith(newRecordData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdRecord,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Medical record created", {
        id: 1,
        patient_id: 5,
      });
    });

    it("should create medical record with minimal required fields", async () => {
      const newRecordData = {
        patient_id: 5,
        diagnosis: "Headache",
      };

      const createdRecord = {
        id: 1,
        ...newRecordData,
        doctor_id: null,
        appointment_id: null,
        created_at: "2024-08-20",
      };

      mockReq.body = newRecordData;
      MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord.mockResolvedValue(
        createdRecord,
      );

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(
        MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord,
      ).toHaveBeenCalledWith(newRecordData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdRecord,
      });
    });

    it("should return 400 when patient_id is missing", async () => {
      mockReq.body = {
        diagnosis: "Bronchitis",
        doctor_id: 1,
      };

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "patient_id and diagnosis are required",
      });
      expect(loggerModule.default.warn).toHaveBeenCalledWith(
        "Missing required fields for medical record creation",
      );
    });

    it("should return 400 when diagnosis is missing", async () => {
      mockReq.body = {
        patient_id: 5,
        doctor_id: 1,
      };

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "patient_id and diagnosis are required",
      });
    });

    it("should return 400 when both patient_id and diagnosis are missing", async () => {
      mockReq.body = {
        doctor_id: 1,
        symptoms: "Cough",
      };

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "patient_id and diagnosis are required",
      });
    });

    it("should handle error when creating medical record", async () => {
      const error = new Error("Patient not found");
      mockReq.body = {
        patient_id: 999,
        diagnosis: "Bronchitis",
        doctor_id: 1,
      };

      MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord.mockRejectedValue(
        error,
      );

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Patient not found",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error creating medical record", {
        message: "Patient not found",
      });
    });

    it("should handle database error when creating medical record", async () => {
      const error = new Error("Database connection error");
      mockReq.body = {
        patient_id: 5,
        diagnosis: "Bronchitis",
      };

      MedicalRecordsServiceModule.MedicalRecordsService.createMedicalRecord.mockRejectedValue(
        error,
      );

      await MedicalRecordsController.createMedicalRecord(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
    });
  });
});
