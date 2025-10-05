/**
 * Preview API - Serves landing page previews
 */

import { Request, Response } from "express";
import * as path from "path";
import * as fs from "fs/promises";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

export async function previewHandler(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const htmlPath = path.join(projectPath, "index.html");

    // Check if file exists
    await fs.access(htmlPath);

    // Serve the HTML file
    res.sendFile(htmlPath);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      res.status(404).json({ error: "Project not found" });
    } else {
      console.error("Preview error:", error);
      res.status(500).json({ error: "Failed to load preview" });
    }
  }
}

export async function getCodeHandler(req: Request, res: Response) {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const htmlPath = path.join(projectPath, "index.html");

    const content = await fs.readFile(htmlPath, "utf-8");

    // Parse sections
    const htmlMatch = content.match(/<body>([\s\S]*?)<script>/);
    const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    const jsMatch = content.match(/<script>([\s\S]*?)<\/script>/);

    res.json({
      success: true,
      projectId,
      fullHtml: content,
      html: htmlMatch ? htmlMatch[1].trim() : "",
      css: cssMatch ? cssMatch[1].trim() : "",
      js: jsMatch ? jsMatch[1].trim() : "",
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      res.status(404).json({ error: "Project not found" });
    } else {
      console.error("Get code error:", error);
      res.status(500).json({ error: "Failed to retrieve code" });
    }
  }
}
