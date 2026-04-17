import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRoutes from "./routes/router.js";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  logger.info(
    `Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});
