/**
 * Express Server - Landing Maker Backend
 */

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { chatHandler } from "./api/chat.js";
import { previewHandler, getCodeHandler } from "./api/preview.js";
import * as path from "path";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.post("/api/chat", chatHandler);
app.get("/api/preview/:projectId", previewHandler);
app.get("/api/code/:projectId", getCodeHandler);

// Static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
} else {
  // Serve landing page on root in dev mode
  app.use(express.static(path.join(process.cwd(), "public")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Landing Maker server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   POST   /api/chat`);
  console.log(`   GET    /api/preview/:projectId`);
  console.log(`   GET    /api/code/:projectId`);
});
