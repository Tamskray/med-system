import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/router.js";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}`;
const MODE = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  logger.info(`Server running on ${API_URL} in ${MODE} mode`);
});
