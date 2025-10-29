// server/src/app.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import dotenv from "dotenv";
import apiLogRoutes from "./routes/apiLogRoutes.js";
import form13 from "./routes/form13.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://8c749e4308c4.ngrok-free.app",
   ],
  
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiLogRoutes);
app.use("/api/form13", form13);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// MongoDB connection with better error handling
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/handover";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${MONGODB_URI}`);
});
