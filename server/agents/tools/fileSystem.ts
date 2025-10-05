/**
 * File System Tools for Landing Page Generation
 * Following LlamaIndex FunctionTool pattern
 */

import { FunctionTool } from "llamaindex";
import * as fs from "fs/promises";
import * as path from "path";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

/**
 * Tool: create_html
 * Creates a new landing page with HTML/CSS/JS
 */
export const createHtmlTool = FunctionTool.from(
  async ({
    projectId,
    html,
    css,
    js,
  }: {
    projectId?: string;
    html: string;
    css?: string;
    js?: string;
  }) => {
    try {
      // Generate projectId if not provided
      const finalProjectId = projectId || `landing-${Date.now()}`;
      const projectPath = path.join(PROJECTS_DIR, finalProjectId);
      await fs.mkdir(projectPath, { recursive: true });

      // Write index.html with embedded CSS and JS
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
${css || "/* Add your styles here */"}
  </style>
</head>
<body>
${html}
  <script>
${js || "// Add your JavaScript here"}
  </script>
</body>
</html>`;

      await fs.writeFile(path.join(projectPath, "index.html"), fullHtml);

      return JSON.stringify({
        success: true,
        projectId: finalProjectId,
        message: `✅ Landing page created successfully! Preview at /api/preview/${finalProjectId}`,
        files: ["index.html"],
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "create_html",
    description: `Creates a new landing page with HTML, CSS, and JavaScript.

Parameters:
- projectId: (Optional) Unique ID for this project. If not provided, will auto-generate one
- html: The HTML body content (required)
- css: (Optional) CSS styles
- js: (Optional) JavaScript code

Returns JSON with success status, generated projectId, and preview URL.`,
  }
);

/**
 * Tool: edit_code
 * Edits existing landing page code
 */
export const editCodeTool = FunctionTool.from(
  async ({
    projectId,
    html,
    css,
    js,
  }: {
    projectId: string;
    html?: string;
    css?: string;
    js?: string;
  }) => {
    try {
      const projectPath = path.join(PROJECTS_DIR, projectId);
      const htmlPath = path.join(projectPath, "index.html");

      // Read existing file
      const existingContent = await fs.readFile(htmlPath, "utf-8");

      // Parse and update sections
      let updatedContent = existingContent;

      if (html) {
        updatedContent = updatedContent.replace(
          /<body>([\s\S]*?)<script>/,
          `<body>\n${html}\n  <script>`
        );
      }

      if (css) {
        updatedContent = updatedContent.replace(
          /<style>([\s\S]*?)<\/style>/,
          `<style>\n${css}\n  </style>`
        );
      }

      if (js) {
        updatedContent = updatedContent.replace(
          /<script>([\s\S]*?)<\/script>/,
          `<script>\n${js}\n  </script>`
        );
      }

      await fs.writeFile(htmlPath, updatedContent);

      return JSON.stringify({
        success: true,
        projectId,
        message: `✅ Code updated successfully! Refresh preview at /api/preview/${projectId}`,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "edit_code",
    description: `Edits an existing landing page's HTML, CSS, or JavaScript.

Parameters:
- projectId: The project ID to edit
- html: (Optional) New HTML body content
- css: (Optional) New CSS styles
- js: (Optional) New JavaScript code

Only provide the sections you want to update. Returns JSON with success status.`,
  }
);

/**
 * Tool: get_code
 * Retrieves current code from a project
 */
export const getCodeTool = FunctionTool.from(
  async ({ projectId }: { projectId: string }) => {
    try {
      const projectPath = path.join(PROJECTS_DIR, projectId);
      const htmlPath = path.join(projectPath, "index.html");

      const content = await fs.readFile(htmlPath, "utf-8");

      // Parse sections
      const htmlMatch = content.match(/<body>([\s\S]*?)<script>/);
      const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
      const jsMatch = content.match(/<script>([\s\S]*?)<\/script>/);

      return JSON.stringify({
        success: true,
        projectId,
        html: htmlMatch ? htmlMatch[1].trim() : "",
        css: cssMatch ? cssMatch[1].trim() : "",
        js: jsMatch ? jsMatch[1].trim() : "",
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "get_code",
    description: `Retrieves the current HTML, CSS, and JS code from a project.

Parameters:
- projectId: The project ID to retrieve

Returns JSON with the current code sections.`,
  }
);
