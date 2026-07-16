// Mock modules BEFORE any imports to prevent initialization errors
jest.mock("../supabase.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("../services/rooms.js");
jest.mock("../utils/logger.js");

import { RoomsController } from "./rooms.js";
import * as RoomsServiceModule from "../services/rooms.js";
import * as loggerModule from "../utils/logger.js";

describe("RoomsController", () => {
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

    // Setup RoomsService mock
    RoomsServiceModule.RoomsService = {
      getAllRooms: jest.fn(),
    };

    // Setup logger mock
    loggerModule.default = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe("getAllRooms", () => {
    it("should return all rooms with success status", async () => {
      const mockRooms = [
        {
          id: 1,
          room_number: "101",
          building: "A",
          floor: 1,
          capacity: 2,
        },
        {
          id: 2,
          room_number: "102",
          building: "A",
          floor: 1,
          capacity: 3,
        },
        {
          id: 3,
          room_number: "201",
          building: "B",
          floor: 2,
          capacity: 2,
        },
      ];

      RoomsServiceModule.RoomsService.getAllRooms.mockResolvedValue(mockRooms);

      await RoomsController.getAllRooms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRooms,
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all rooms", {
        count: 3,
      });
    });

    it("should return empty array when no rooms exist", async () => {
      const mockRooms = [];

      RoomsServiceModule.RoomsService.getAllRooms.mockResolvedValue(mockRooms);

      await RoomsController.getAllRooms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
      expect(loggerModule.default.info).toHaveBeenCalledWith("Fetched all rooms", {
        count: 0,
      });
    });

    it("should handle error when fetching rooms", async () => {
      const error = new Error("Database connection error");
      RoomsServiceModule.RoomsService.getAllRooms.mockRejectedValue(error);

      await RoomsController.getAllRooms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection error",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching rooms", {
        message: "Database connection error",
      });
    });

    it("should handle service error with different error message", async () => {
      const error = new Error("Query timeout");
      RoomsServiceModule.RoomsService.getAllRooms.mockRejectedValue(error);

      await RoomsController.getAllRooms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Query timeout",
      });
      expect(loggerModule.default.error).toHaveBeenCalledWith("Error fetching rooms", {
        message: "Query timeout",
      });
    });
  });
});
