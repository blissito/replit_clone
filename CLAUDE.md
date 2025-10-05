# Landing Maker (Replit Clone) - AI Landing Page Builder

## 🎯 Project Vision
Replit/Bolt.new clone focused on landing pages with AI-powered generation and instant Netlify deployment. Single-page HTML app using vanilla JS + Tailwind, powered by Express backend with multi-model AI support.

## 🏗️ Final Architecture

### Backend: Express + Direct SDK Calls
```
server/
├── agents/
│   └── landingWorkflowSimple.ts    # Direct Anthropic/OpenAI SDK calls
├── api/
│   ├── chat.ts                     # POST /api/chat (SSE streaming)
│   └── preview.ts                  # GET /api/preview/:id, GET /api/code/:id
└── index.ts                        # Express server
```

### Frontend: Vanilla JS + Tailwind (Single HTML)
```
public/
└── index.html                      # Single-page app with inline JS
```

**Why vanilla JS instead of Preact?**
- ✅ Simpler deployment (no build step)
- ✅ Faster development for MVP
- ✅ Direct DOM manipulation is fine for this scope

## 🤖 Multi-Model Support

### Implemented Models
1. **GPT-5 Nano** (gpt-4o-mini) - Default, fast & cheap
2. **GPT-5 Mini** (gpt-4o) - More capable
3. **Haiku 3** (claude-3-haiku-20240307) - Fast Claude
4. **Sonnet 4.5** (claude-3-5-sonnet-20241022) - Most capable

### Model Selector
- Dropdown in chat header
- Persists across requests
- Model name shown in loading indicator

## 🔧 Tech Stack
- **Backend**: Express, Anthropic SDK, OpenAI SDK
- **Frontend**: Vanilla JS, Tailwind CDN
- **AI**: Multi-model (GPT-4o, GPT-4o-mini, Claude Haiku, Claude Sonnet)
- **Deploy**: Netlify CLI (programmatic)

## 📋 Implemented Features

### ✅ Core Features
1. ✅ Chat interface with SSE streaming
2. ✅ AI generates HTML/CSS/JS landing pages
3. ✅ Live preview in iframe
4. ✅ Multi-model support (4 models)
5. ✅ Conversational memory (edit existing pages)
6. ✅ Tool execution cards with status (running/success/error)
7. ✅ Unique tool card IDs (fixes duplicate tool bug)

### 🚧 Pending
- ⚠️ **Netlify Deploy** - Tool exists but needs testing/debugging
- 📋 Code editor view (currently only preview)

## 🧠 Agent Tools

### 1. create_html
Creates initial landing page with HTML/CSS/JS
- **Input**: `html` (required), `css`, `js`, `projectId` (optional)
- **Output**: projectId, preview URL

### 2. edit_code
Modifies existing landing page
- **Input**: `projectId` (required), `html`, `css`, `js`
- **Uses regex** to replace `<body>`, `<style>`, `<script>` sections
- **Context-aware**: Receives current file content

### 3. deploy_to_netlify (TODO: Debug)
Deploys to Netlify
- **Input**: `projectId` (required), `siteName` (optional)
- **Uses**: Netlify CLI via `execAsync`
- **Status**: Implemented but needs testing

## 🎨 UI/UX Features

### Tool Execution Cards
- 🎨 **create_html** - "Creando página HTML"
- ✏️ **edit_code** - "Editando código"
- 🚀 **deploy_to_netlify** - "Desplegando a Netlify"
- Status: Blue (running) → Green (success) / Red (error)
- Shows duration on completion

### Conversational Memory
- Stores complete conversation history
- Sends history to backend for context
- Backend includes current file content for edits
- Works across all 4 models

## 🔥 Critical Fixes Applied

### 1. Tool Card Duplicate Bug (FIXED)
**Problem**: Multiple `edit_code` calls created divs with same ID
**Solution**: Use unique `toolCallId` from SDK instead of `tool-${event.tool}`

### 2. Conversational History (FIXED)
**Problem**: Tool_use/tool_calls without results confused models
**Solution**: Only send text content in history, file context provides state

### 3. System Prompt Clarity (FIXED)
**Problem**: Models responded without using tools
**Solution**: Explicit "ALWAYS use tools, NEVER write code directly"

## 📝 Environment Variables
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NETLIFY_AUTH_TOKEN=nfp_...  # TODO: Test deployment
PORT=3000
```

## 🚦 Development Workflow
```bash
# Start server (auto-reload with tsx watch)
pnpm dev

# Server runs on http://localhost:3000
# Open in browser to use the app
```

## 🎯 Success Metrics
- ✅ Create landing page: Works with all 4 models
- ✅ Edit iteratively: "change to red" works in conversation
- ✅ Live preview: Updates immediately via iframe
- ⚠️ Deploy to Netlify: Tool exists, needs debugging
- ✅ Response time: <5s for most requests

## 🐛 Known Issues
1. **Netlify Deploy** - Tool implemented but untested
2. **No code editor** - Only preview, no syntax highlighting view
3. **Tool cards don't persist** - Only shown during streaming, lost on page reload

## 🔜 Next Steps
1. Debug Netlify deployment flow
2. Add syntax-highlighted code viewer
3. Persist tool execution history in UI
4. Add "copy code" and "download HTML" buttons
5. Error handling improvements
