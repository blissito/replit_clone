/**
 * Landing Workflow - Usando Anthropic SDK directo (más simple)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PROJECTS_DIR = path.join(process.cwd(), "projects");

/**
 * Transform frontend message format to Claude SDK format
 * SIMPLIFIED: Only text content, no tool reconstruction (avoids incomplete tool_use/tool_result pairs)
 */
function transformHistoryForClaude(
  history: Array<{ role: "user" | "assistant"; content: string; toolExecutions?: any[] }>
): Anthropic.MessageParam[] {
  const transformed: Anthropic.MessageParam[] = [];

  for (const msg of history) {
    if (msg.role === "user") {
      transformed.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      // Only send text content - file context provides the state
      if (msg.content) {
        transformed.push({ role: "assistant", content: msg.content });
      }
    }
  }

  return transformed;
}

/**
 * Transform frontend message format to OpenAI SDK format
 * SIMPLIFIED: Only text content, no tool reconstruction (avoids incomplete tool_calls/tool_results pairs)
 */
function transformHistoryForOpenAI(
  history: Array<{ role: "user" | "assistant"; content: string; toolExecutions?: any[] }>
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const transformed: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  for (const msg of history) {
    if (msg.role === "user") {
      transformed.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      // Only send text content - file context provides the state
      if (msg.content) {
        transformed.push({
          role: "assistant",
          content: msg.content,
        });
      }
    }
  }

  return transformed;
}

// Define tools for Anthropic
const toolsAnthropic: Anthropic.Tool[] = [
  {
    name: "create_html",
    description: "Creates a new landing page with HTML, CSS, and JavaScript. projectId is optional (auto-generated if not provided).",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Optional project ID" },
        html: { type: "string", description: "HTML body content (required)" },
        css: { type: "string", description: "CSS styles (optional)" },
        js: { type: "string", description: "JavaScript code (optional)" },
      },
      required: ["html"],
    },
  },
  {
    name: "edit_code",
    description: "Edits an existing landing page",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project ID to edit" },
        html: { type: "string", description: "New HTML (optional)" },
        css: { type: "string", description: "New CSS (optional)" },
        js: { type: "string", description: "New JS (optional)" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "deploy_to_netlify",
    description: "Deploys a landing page to Netlify and returns the public URL. Use this when the user asks to deploy or publish the page.",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project ID to deploy (required)" },
        siteName: { type: "string", description: "Optional Netlify site name" },
      },
      required: ["projectId"],
    },
  },
];

// Define tools for OpenAI (different format)
const toolsOpenAI: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_html",
      description: "Creates a new landing page with HTML, CSS, and JavaScript. projectId is optional (auto-generated if not provided).",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string", description: "Optional project ID" },
          html: { type: "string", description: "HTML body content (required)" },
          css: { type: "string", description: "CSS styles (optional)" },
          js: { type: "string", description: "JavaScript code (optional)" },
        },
        required: ["html"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_code",
      description: "Edits an existing landing page",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string", description: "Project ID to edit" },
          html: { type: "string", description: "New HTML (optional)" },
          css: { type: "string", description: "New CSS (optional)" },
          js: { type: "string", description: "New JS (optional)" },
        },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deploy_to_netlify",
      description: "Deploys a landing page to Netlify and returns the public URL. Use this when the user asks to deploy or publish the page.",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string", description: "Project ID to deploy (required)" },
          siteName: { type: "string", description: "Optional Netlify site name" },
        },
        required: ["projectId"],
      },
    },
  },
];

// Execute tool
async function executeTool(toolName: string, toolInput: any): Promise<string> {
  console.log(`🔧 Executing tool: ${toolName}`, JSON.stringify(toolInput, null, 2));

  try {
    if (toolName === "create_html") {
      const projectId = toolInput.projectId || `landing-${Date.now()}`;
      const projectPath = path.join(PROJECTS_DIR, projectId);
      await fs.mkdir(projectPath, { recursive: true });

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
${toolInput.css || "/* Styles */"}
  </style>
</head>
<body>
${toolInput.html}
  <script>
${toolInput.js || "// JavaScript"}
  </script>
</body>
</html>`;

      await fs.writeFile(path.join(projectPath, "index.html"), fullHtml);
      console.log(`✅ Created project: ${projectId}`);

      return JSON.stringify({
        success: true,
        projectId,
        message: `✅ Created! Preview: /api/preview/${projectId}`,
        files: ["index.html"],
      });
    }

    if (toolName === "edit_code") {
      if (!toolInput.projectId) {
        throw new Error("projectId is required for edit_code");
      }

      const htmlPath = path.join(PROJECTS_DIR, toolInput.projectId, "index.html");

      // Check if file exists
      try {
        await fs.access(htmlPath);
      } catch (error) {
        throw new Error(`Project ${toolInput.projectId} not found at ${htmlPath}`);
      }

      let content = await fs.readFile(htmlPath, "utf-8");
      console.log(`📖 Read file, length: ${content.length} chars`);

      let changesApplied = 0;

      // ROBUST regex replacements with validation
      if (toolInput.html) {
        const regex = /<body[^>]*>([\s\S]*?)<script/i;
        if (regex.test(content)) {
          const before = content.length;
          content = content.replace(regex, `<body>\n${toolInput.html}\n  <script`);
          console.log(`📝 HTML replaced: ${before} → ${content.length} chars`);
          changesApplied++;
        } else {
          console.warn(`⚠️ Could not find <body>...<script pattern`);
        }
      }

      if (toolInput.css) {
        const regex = /<style[^>]*>([\s\S]*?)<\/style>/i;
        if (regex.test(content)) {
          content = content.replace(regex, `<style>\n${toolInput.css}\n  </style>`);
          console.log(`🎨 CSS replaced`);
          changesApplied++;
        } else {
          console.warn(`⚠️ Could not find <style>...</style> pattern`);
        }
      }

      if (toolInput.js) {
        const regex = /<script[^>]*>([\s\S]*?)<\/script>/i;
        if (regex.test(content)) {
          content = content.replace(regex, `<script>\n${toolInput.js}\n  </script>`);
          console.log(`📜 JS replaced`);
          changesApplied++;
        } else {
          console.warn(`⚠️ Could not find <script>...</script> pattern`);
        }
      }

      if (changesApplied === 0) {
        throw new Error("No changes applied - regex patterns did not match");
      }

      await fs.writeFile(htmlPath, content);
      console.log(`✅ Saved ${changesApplied} changes to: ${toolInput.projectId}`);

      return JSON.stringify({
        success: true,
        projectId: toolInput.projectId,
        message: `✅ Updated ${changesApplied} section(s)!`,
        files: ["index.html"],
      });
    }

    if (toolName === "deploy_to_netlify") {
      if (!toolInput.projectId) {
        throw new Error("projectId is required for deploy_to_netlify");
      }

      const projectPath = path.join(PROJECTS_DIR, toolInput.projectId);
      const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

      if (!netlifyToken) {
        return JSON.stringify({
          success: false,
          error: "NETLIFY_AUTH_TOKEN not configured. Please add it to .env file.",
        });
      }

      // Deploy to Netlify using CLI
      const deployCommand = toolInput.siteName
        ? `cd "${projectPath}" && netlify deploy --prod --site ${toolInput.siteName} --auth ${netlifyToken} --dir .`
        : `cd "${projectPath}" && netlify deploy --prod --auth ${netlifyToken} --dir .`;

      const { stdout } = await execAsync(deployCommand, {
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
          projectId: toolInput.projectId,
          deployUrl: altUrl,
          message: `🚀 Deployed successfully!\n\n📍 Live URL: ${altUrl}`,
        });
      }

      return JSON.stringify({
        success: true,
        projectId: toolInput.projectId,
        deployUrl,
        message: `🚀 Deployed successfully!\n\n📍 Live URL: ${deployUrl}`,
      });
    }

    return JSON.stringify({ success: false, error: "Unknown tool" });

  } catch (error: any) {
    console.error(`❌ Tool execution error (${toolName}):`, error);
    return JSON.stringify({
      success: false,
      error: error.message || "Tool execution failed",
    });
  }
}

/**
 * Stream landing page workflow
 */
export async function* streamLandingWorkflow(
  message: string,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  currentProjectId?: string | null,
  model?: string
) {
  // Map model names to actual API model IDs
  const modelMapping: Record<string, string> = {
    "gpt-5-nano": "gpt-4o-mini",
    "gpt-5-mini": "gpt-4o",
    "claude-3-haiku-20240307": "claude-3-haiku-20240307",
    "claude-3-5-sonnet-20241022": "claude-3-5-sonnet-20241022",
  };

  const selectedModel = modelMapping[model || ""] || "claude-3-haiku-20240307";
  const isGPT = selectedModel.startsWith("gpt");

  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY!,
  });

  // CRITICAL FIX: Read current project file if it exists
  let currentFileContent = "";
  if (currentProjectId) {
    try {
      const htmlPath = path.join(PROJECTS_DIR, currentProjectId, "index.html");
      currentFileContent = await fs.readFile(htmlPath, "utf-8");
      console.log(`📖 Read existing project: ${currentProjectId}`);
    } catch (error) {
      console.log(`⚠️ Could not read project ${currentProjectId}, treating as new`);
    }
  }

  // Build user message with current file context
  let userMessage = message;
  if (currentFileContent) {
    userMessage = `CURRENT LANDING PAGE CODE:
\`\`\`html
${currentFileContent}
\`\`\`

USER REQUEST: ${message}

Use the edit_code tool with projectId="${currentProjectId}" to update the existing code based on the user's request.`;
  }

  // Transform conversation history to SDK format (Claude)
  const historyMessages = conversationHistory && conversationHistory.length > 0
    ? transformHistoryForClaude(conversationHistory)
    : [];

  const messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  // Build context-aware system prompt
  let systemPrompt = `You are an expert landing page designer with access to tools.

CRITICAL RULES:
1. ALWAYS use the create_html or edit_code tools to generate/modify code
2. NEVER write code directly in your response
3. After using a tool, respond with a brief narrative: "✨ Created modern landing page"
4. Users expect you to USE TOOLS, not explain code

Available tools:
- create_html: Creates new landing pages (use for first request)
- edit_code: Edits existing pages (use when projectId exists)
- deploy_to_netlify: Deploys to production

Design principles:
- Modern, responsive designs
- Clean typography and spacing
- Smooth animations and gradients`;

  if (currentProjectId && currentFileContent) {
    systemPrompt += `\n\nCURRENT CONTEXT: You are editing an existing project (${currentProjectId}). MUST use edit_code tool with this projectId.`;
  }

  try {
    // Handle GPT models
    if (isGPT) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      // Transform conversation history to OpenAI format
      const historyMessagesGPT = conversationHistory && conversationHistory.length > 0
        ? transformHistoryForOpenAI(conversationHistory)
        : [];

      const gptMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...historyMessagesGPT,
        { role: "user", content: userMessage },
      ];

      const response = await openai.chat.completions.create({
        model: selectedModel,
        messages: gptMessages,
        tools: toolsOpenAI,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;

      // Handle tool calls - FIXED: Execute ALL tools first, then ONE follow-up
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        // Execute ALL tools and collect results
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          const toolIcons: Record<string, string> = {
            create_html: "🎨",
            edit_code: "✏️",
            deploy_to_netlify: "🚀",
          };

          const toolMessages: Record<string, string> = {
            create_html: "Creating...",
            edit_code: "Updating...",
            deploy_to_netlify: "Deploying...",
          };

          yield {
            type: "tool-start",
            tool: toolName,
            icon: toolIcons[toolName] || "🔧",
            message: toolMessages[toolName] || "Processing...",
            toolCallId: toolCall.id, // For persistence
            toolInput: toolArgs, // For persistence
          };

          const result = await executeTool(toolName, toolArgs);
          const parsed = JSON.parse(result);

          if (!parsed.success) {
            yield {
              type: "tool-error",
              tool: toolName,
              message: parsed.error || "Tool execution failed",
            };
          } else {
            yield {
              type: "tool-success",
              tool: toolName,
              toolCallId: toolCall.id, // CRITICAL: Match with tool-start
              files: parsed.files || [],
              message: parsed.message,
            };

            if (parsed.projectId) {
              yield {
                type: "code-updated",
                projectId: parsed.projectId,
              };
            }
          }

          // Collect tool result
          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        // ONE follow-up with ALL results and tools enabled
        const followUp = await openai.chat.completions.create({
          model: selectedModel,
          messages: [
            ...gptMessages,
            message,
            ...toolResults,
          ],
          tools: toolsOpenAI, // CRITICAL: Enable tools for subsequent calls
        });

        const followUpText = followUp.choices[0].message.content;
        if (followUpText) {
          yield {
            type: "chunk",
            content: followUpText,
          };
        }
      } else if (message.content) {
        // No tool calls, just text response
        yield {
          type: "chunk",
          content: message.content,
        };
      }

      yield { type: "done" };
      return;
    }

    // Handle Claude models
    const response = await client.messages.create({
      model: selectedModel,
      max_tokens: 4096,
      tools: toolsAnthropic,
      messages,
      system: systemPrompt,
    });

    console.log("🤖 Response:", response);

    // Handle tool use
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log("🔧 Tool use:", block.name);

        const toolIcons: Record<string, string> = {
          create_html: "🎨",
          edit_code: "✏️",
          deploy_to_netlify: "🚀",
        };

        const toolMessages: Record<string, string> = {
          create_html: "Creating...",
          edit_code: "Updating...",
          deploy_to_netlify: "Deploying...",
        };

        yield {
          type: "tool-start",
          tool: block.name,
          icon: toolIcons[block.name] || "🔧",
          message: toolMessages[block.name] || "Processing...",
          toolCallId: block.id, // For persistence
          toolInput: block.input, // For persistence
        };

        const result = await executeTool(block.name, block.input);
        console.log("✅ Tool result:", result);

        const parsed = JSON.parse(result);

        // Check if tool execution failed
        if (!parsed.success) {
          console.error("❌ Tool failed:", parsed.error);
          yield {
            type: "tool-error",
            tool: block.name,
            message: parsed.error || "Tool execution failed",
          };
          // Continue anyway to let Claude respond
        } else {
          yield {
            type: "tool-success",
            tool: block.name,
            toolCallId: block.id, // CRITICAL: Match with tool-start
            files: parsed.files || [],
            message: parsed.message,
          };

          if (parsed.projectId) {
            console.log("📤 Code updated:", parsed.projectId);
            yield {
              type: "code-updated",
              projectId: parsed.projectId,
            };
          }
        }

        // Continue with tool result
        const followUp = await client.messages.create({
          model: selectedModel,
          max_tokens: 1024,
          tools: toolsAnthropic,
          messages: [
            ...messages,
            { role: "assistant", content: response.content },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: result,
                },
              ],
            },
          ],
        });

        // Stream text response
        for (const followBlock of followUp.content) {
          if (followBlock.type === "text") {
            yield {
              type: "chunk",
              content: followBlock.text,
            };
          }
        }
      } else if (block.type === "text") {
        yield {
          type: "chunk",
          content: block.text,
        };
      }
    }

    yield { type: "done" };
  } catch (error) {
    console.error("❌ Error:", error);
    yield {
      type: "error",
      content: "Something went wrong",
    };
  }
}
