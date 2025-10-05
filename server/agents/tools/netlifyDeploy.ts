/**
 * Netlify Deploy Tool
 * Uses Netlify CLI programmatically to deploy landing pages
 */

import { FunctionTool } from "llamaindex";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);

const PROJECTS_DIR = path.join(process.cwd(), "projects");

/**
 * Tool: deploy_to_netlify
 * Deploys a landing page to Netlify and returns public URL
 */
export const deployToNetlifyTool = FunctionTool.from(
  async ({
    projectId,
    siteName,
  }: {
    projectId: string;
    siteName?: string;
  }) => {
    try {
      const projectPath = path.join(PROJECTS_DIR, projectId);
      const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

      if (!netlifyToken) {
        return JSON.stringify({
          success: false,
          error: "NETLIFY_AUTH_TOKEN not configured. Please add it to .env file.",
        });
      }

      // Deploy to Netlify using CLI
      // Using --prod flag for production deployment
      const deployCommand = siteName
        ? `cd "${projectPath}" && netlify deploy --prod --site ${siteName} --auth ${netlifyToken} --dir .`
        : `cd "${projectPath}" && netlify deploy --prod --auth ${netlifyToken} --dir .`;

      const { stdout, stderr } = await execAsync(deployCommand, {
        timeout: 60000, // 60 second timeout
      });

      // Parse deploy URL from output
      const urlMatch = stdout.match(/Website URL:\s+(https:\/\/[^\s]+)/);
      const deployUrl = urlMatch ? urlMatch[1] : null;

      if (!deployUrl) {
        // Try alternate pattern
        const altMatch = stdout.match(/Live URL:\s+(https:\/\/[^\s]+)/);
        const altUrl = altMatch ? altMatch[1] : null;

        if (!altUrl) {
          return JSON.stringify({
            success: false,
            error: "Failed to extract deployment URL from Netlify response",
            output: stdout,
          });
        }

        return JSON.stringify({
          success: true,
          projectId,
          deployUrl: altUrl,
          message: `🚀 **Deployed successfully!**\n\n📍 **Live URL:** ${altUrl}\n\n✨ Your landing page is now public!`,
        });
      }

      return JSON.stringify({
        success: true,
        projectId,
        deployUrl,
        message: `🚀 **Deployed successfully!**\n\n📍 **Live URL:** ${deployUrl}\n\n✨ Your landing page is now public!`,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error.message,
        stderr: error.stderr,
      });
    }
  },
  {
    name: "deploy_to_netlify",
    description: `Deploys a landing page to Netlify and returns the public URL.

Parameters:
- projectId: The project ID to deploy
- siteName: (Optional) Specific Netlify site name to deploy to

Returns JSON with the live deployment URL. Requires NETLIFY_AUTH_TOKEN environment variable.`,
  }
);
