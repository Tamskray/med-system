// Mock modules BEFORE any imports to prevent initialization errors
jest.mock("../supabase.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("../services/departments.js");
jest.mock("../utils/logger.js");

import { DepartmentsController } from "./departments.js";
import * as DepartmentsServiceModule from "../services/departments.js";
import * as loggerModule from "../utils/logger.js";

describe("DepartmentsController", () => {
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

    // Setup DepartmentsService mock
    DepartmentsServiceModule.DepartmentsService = {
      getAllDepartments: jest.fn(),
    };

    // Setup logger mock
    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("getAllDepartments", () => {
    it("should return all departments with success status", async () => {
      const mockDepartments = [
        {
          id: 1,
          name: "Cardiology",
          description: "Heart and cardiovascular diseases",
        },
        {
          id: 2,
          name: "Neurology",
          description: "Brain and nervous system",
        },
        {
          id: 3,
          name: "Orthopedics",
          description: "Bones and joints",
        },
      ];

      DepartmentsServiceModule.DepartmentsService.getAllDepartments.mockResolvedValue(
        mockDepartments,
      );

      await DepartmentsController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDepartments,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all departments", {
        count: 3,
      });
    });

    it("should return empty array when no departments exist", async () => {
      const mockDepartments = [];

      DepartmentsServiceModule.DepartmentsService.getAllDepartments.mockResolvedValue(
        mockDepartments,
      );

      await DepartmentsController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all departments", {
        count: 0,
      });
    });

    it("should handle error when fetching departments", async () => {
      const error = new Error("Database connection error");
      DepartmentsServiceModule.DepartmentsService.getAllDepartments.mockRejectedValue(error);

      await DepartmentsController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching departments", {
        message: "Database connection error",
      });
    });

    it("should handle service error with different error message", async () => {
      const error = new Error("Query timeout");
      DepartmentsServiceModule.DepartmentsService.getAllDepartments.mockRejectedValue(error);

      await DepartmentsController.getAllDepartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Query timeout",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching departments", {
        message: "Query timeout",
      });
    });
  });
});
