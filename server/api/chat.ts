/**
 * Chat API - Server-Sent Events (SSE) streaming endpoint
 * Connects to LlamaIndex Agent Workflow
 */

import { Request, Response } from "express";
import { streamLandingWorkflow } from "../agents/landingWorkflowSimple.js";

export async function chatHandler(req: Request, res: Response) {
  const { message, conversationHistory, projectId, model } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  console.log(`📩 Received message: "${message}"`);
  console.log(`📚 Conversation history: ${conversationHistory?.length || 0} messages`);
  console.log(`🆔 Current projectId: ${projectId || "none"}`);
  console.log(`🤖 Model: ${model || "default"}`);

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Stream from agent workflow with projectId context
    for await (const event of streamLandingWorkflow(
      message,
      conversationHistory,
      projectId,
      model
    )) {
      console.log("📡 Sending SSE:", event.type);
      // Send SSE event
      res.write(`data: ${JSON.stringify(event)}\n\n`);

      // End stream on done or error
      if (event.type === "done" || event.type === "error") {
        res.end();
        break;
      }
    }
  } catch (error: any) {
    console.error("Chat handler error:", error);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        content: "Internal server error",
      })}\n\n`
    );
    res.end();
  }
}
