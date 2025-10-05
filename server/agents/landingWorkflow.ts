/**
 * LandingWorkflow - Pure LlamaIndex Agent Workflow Pattern
 * Single agent with all tools, zero custom routing logic
 * Model decides which tools to use
 *
 * Follows the exact pattern from your shared code
 */

import {
  agent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  agentStreamEvent,
} from "@llamaindex/workflow";
import { OpenAI } from "@llamaindex/openai";
import { createMemory } from "llamaindex";
import {
  createHtmlTool,
  editCodeTool,
  getCodeTool,
} from "./tools/fileSystem.js";
import { deployToNetlifyTool } from "./tools/netlifyDeploy.js";

// Types
interface WorkflowContext {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Create LLM instance (following your exact pattern)
 */
function createLLM(model: string = "gpt-4o-mini", temperature: number = 0.3) {
  const config: any = {
    model,
    temperature,
    maxCompletionTokens: 2000, // More tokens for code generation
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3,
  };

  return new OpenAI(config);
}

/**
 * Build system prompt for landing page generation
 */
function buildSystemPrompt(): string {
  return `You are an expert landing page designer and developer. You create beautiful, modern, responsive landing pages using HTML, CSS, and vanilla JavaScript.

🎯 YOUR MISSION:
Help users create professional landing pages quickly. Always generate complete, production-ready code.

🛠️ AVAILABLE TOOLS:
1. **create_html**: Create a new landing page with HTML/CSS/JS
2. **edit_code**: Modify existing landing page code
3. **get_code**: Retrieve current code from a project
4. **deploy_to_netlify**: Deploy to Netlify and get public URL

📐 DESIGN PRINCIPLES:
- **Modern**: Use contemporary design trends (gradients, glassmorphism, smooth animations)
- **Responsive**: Mobile-first approach, works on all devices
- **Clean**: Minimal, focused design with clear CTAs
- **Fast**: Vanilla JS only, no dependencies, optimize performance

✅ WORKFLOW:
1. User describes their landing page → Use create_html with a unique projectId
2. User requests changes → Use edit_code to modify
3. User wants to deploy → Use deploy_to_netlify to publish

💡 CODE GENERATION RULES:
- Always include responsive meta viewport tag
- Use modern CSS (flexbox, grid, CSS variables)
- Add smooth scroll behavior and transitions
- Include proper semantic HTML5 tags
- Generate complete, working code (no placeholders)
- Use inline CSS and JS (single-file deployment)

🎨 STYLE GUIDELINES:
- Modern color palettes (use CSS variables)
- Smooth gradients and shadows
- Clean typography (system fonts)
- Clear visual hierarchy
- Professional spacing and alignment

🚀 When deploying:
- ALWAYS copy the deployment URL EXACTLY as returned by the tool
- Format as: "🚀 Deployed: [URL]"
- DO NOT modify or add prefixes to the URL

⚠️ CRITICAL RESPONSE FORMAT (like Cursor AI):
- DO NOT include code blocks in your responses (no \`\`\`html, \`\`\`css, etc.)
- The tools automatically handle code generation and display
- Your responses should only contain:
  ✅ Brief narration: "I've created a modern hero section with gradient background..."
  ✅ Action summaries: "Added responsive navigation with smooth scroll..."
  ✅ Deployment URLs when using deploy_to_netlify
  ✅ User guidance: "You can now preview the page in the Preview panel..."

- Keep responses concise and focused on WHAT you did, not HOW (the code shows the how)
- Example good response: "✨ Created a landing page with hero section, features grid, and contact form. The design uses a modern gradient color scheme with smooth animations."
- Example bad response: [Contains code blocks or detailed code explanations]

Remember: You're building COMPLETE landing pages, not snippets. Every page should be production-ready. The code editor shows the code automatically - you just narrate the changes!`;
}

/**
 * Create agent with all tools (following your exact pattern)
 */
async function createLandingAgent(context: WorkflowContext) {
  const llm = createLLM();
  const systemPrompt = buildSystemPrompt();

  // All tools - model decides which to use
  const allTools = [
    createHtmlTool,
    editCodeTool,
    getCodeTool,
    deployToNetlifyTool,
  ];

  // Following your exact pattern
  const agentConfig: any = {
    llm,
    tools: allTools,
    systemPrompt,
    verbose: true,
  };

  // Add memory for conversation history
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const memory = createMemory({ tokenLimit: 8000 });

    // Add conversation history to memory
    for (const msg of context.conversationHistory) {
      await memory.add({
        role: msg.role,
        content: msg.content
      });
    }

    agentConfig.memory = memory;
    console.log(`💭 Memory initialized with ${context.conversationHistory.length} messages`);
  }

  return agent(agentConfig);
}

/**
 * Stream agent responses (following your exact pattern)
 */
export async function* streamLandingWorkflow(
  message: string,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
) {
  const context: WorkflowContext = {
    message,
    conversationHistory,
  };

  const MAX_CHUNKS = 2000;
  const MAX_DURATION_MS = 60000; // 60 seconds for code generation
  const startTime = Date.now();

  try {
    const agentInstance = await createLandingAgent(context);
    const events = agentInstance.runStream(message);

    let hasStreamedContent = false;
    let toolsExecuted = 0;
    let toolsUsed: string[] = [];
    let chunkCount = 0;
    let currentTool: string | null = null;
    let lastToolResult: any = null;

    for await (const event of events as any) {
      // 🛡️ Timeout protection
      const elapsed = Date.now() - startTime;
      if (elapsed > MAX_DURATION_MS) {
        console.error(`⏱️ Stream timeout after ${elapsed}ms`);
        yield {
          type: "error",
          content: "⏱️ Response took too long. Please try again.",
        };
        break;
      }

      // 🛡️ Max chunks protection
      if (chunkCount >= MAX_CHUNKS) {
        console.error(`🚫 Max chunks reached: ${chunkCount}`);
        yield {
          type: "error",
          content: "Response too large. Please be more specific.",
        };
        break;
      }

      // Debug: log ALL events to see what we're missing
      console.log("📋 Event:", event.constructor?.name, "Type check:", {
        isToolCall: agentToolCallEvent.include(event),
        isToolResult: agentToolCallResultEvent.include(event),
        isStream: agentStreamEvent.include(event)
      });

      // Tool call events
      if (agentToolCallEvent.include(event)) {
        toolsExecuted++;
        const toolName = event.data.toolName || "unknown_tool";
        toolsUsed.push(toolName);

        // Map tool names to icons and messages
        const toolIcons: Record<string, string> = {
          create_html: "🎨",
          edit_code: "✏️",
          get_code: "📖",
          deploy_to_netlify: "🚀",
        };

        const toolMessages: Record<string, string> = {
          create_html: "Creating landing page...",
          edit_code: "Updating code...",
          get_code: "Reading code...",
          deploy_to_netlify: "Deploying to Netlify...",
        };

        currentTool = toolName;

        yield {
          type: "tool-start",
          tool: toolName,
          icon: toolIcons[toolName] || "🔧",
          message: toolMessages[toolName] || `${toolName}...`,
        };
      }

      // Tool call result events (AFTER tool execution)
      if (agentToolCallResultEvent.include(event)) {
        const toolName = event.data.toolName || currentTool || "unknown_tool";
        // AgentToolCallResult has toolOutput field (not output)
        const toolOutput = event.data.toolOutput;

        console.log("🎯 Tool result for", toolName);

        if (toolOutput) {
          lastToolResult = toolOutput;
          try {
            // toolOutput structure from logs: {id, result: "JSON", isError}
            let resultStr: string;
            if (typeof toolOutput === 'string') {
              resultStr = toolOutput;
            } else if ((toolOutput as any).result) {
              // THIS IS THE CORRECT PATH - from logs
              resultStr = (toolOutput as any).result;
            } else if ((toolOutput as any).content) {
              resultStr = (toolOutput as any).content;
            } else {
              resultStr = JSON.stringify(toolOutput);
            }

            console.log("🔍 Result string:", resultStr);

            // FIX: Remove backslash escapes that break JSON parsing
            resultStr = resultStr.replace(/\\/g, '');

            const result = JSON.parse(resultStr);

            if (result.success) {
              yield {
                type: "tool-success",
                tool: toolName,
                files: result.files || [],
                message: result.message || "Success",
              };

              // If projectId is present, emit code-updated event
              if (result.projectId && (toolName === "create_html" || toolName === "edit_code")) {
                console.log("📤 Emitting code-updated event with projectId:", result.projectId);
                yield {
                  type: "code-updated",
                  projectId: result.projectId,
                };
              }
            } else {
              yield {
                type: "tool-error",
                tool: toolName,
                message: result.error || "Tool execution failed",
              };
            }
          } catch (e) {
            console.log("⚠️ Failed to parse tool result:", e);
            // If result is not JSON, just send success
            yield {
              type: "tool-success",
              tool: toolName,
            };
          }
        }
        currentTool = null;
      }

      // Stream content events
      if (agentStreamEvent.include(event)) {
        if (event.data.delta) {
          chunkCount++;
          hasStreamedContent = true;

          yield {
            type: "chunk",
            content: event.data.delta,
          };
        }
      }
    }

    // Fallback
    if (toolsExecuted > 0 && !hasStreamedContent) {
      yield {
        type: "chunk",
        content: "✅ Tools executed successfully.",
      };
    }

    yield {
      type: "done",
      metadata: {
        toolsExecuted,
        toolsUsed,
      },
    };
  } catch (error) {
    console.error("❌ LandingWorkflow error:", error);
    yield {
      type: "error",
      content: "Sorry, something went wrong. Please try again.",
    };
  }
}
