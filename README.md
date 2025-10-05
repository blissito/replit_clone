# 🚀 Landing Maker

AI-powered landing page builder using **LlamaIndex Agent Workflows**, **Express**, and **Preact**.

## 🎯 Features

- 💬 **Streaming Chat**: Real-time AI responses using Server-Sent Events
- 🤖 **Agent Workflows**: Pure LlamaIndex pattern with autonomous tool selection
- 📝 **Code Editor**: Live CodeMirror preview of generated HTML/CSS/JS
- 👁️ **Live Preview**: Instant iframe preview of landing pages
- 🚀 **Netlify Deploy**: One-click deployment to public URLs

## 🏗️ Architecture

### Backend: Express + LlamaIndex
- **Agent Workflow**: Single agent with 4 tools (create_html, edit_code, get_code, deploy_to_netlify)
- **SSE Streaming**: Real-time event streaming to frontend
- **File System**: Projects stored in `/projects` directory

### Frontend: Preact + Vite
- **3-Panel Layout**: Chat | Code Editor | Live Preview
- **CodeMirror**: Syntax highlighting for HTML/CSS/JS
- **Tailwind CSS**: Modern, responsive styling

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
Create `.env` file:
```env
OPENAI_API_KEY=sk-...
NETLIFY_AUTH_TOKEN=...  # Optional, for deployment
PORT=3000
```

### 3. Run Development
```bash
# Start both backend and frontend
pnpm dev

# Or run separately:
pnpm dev:server  # Backend on :3000
pnpm dev:client  # Frontend on :5173
```

### 4. Open App
Open http://localhost:5173

## 📋 Usage

1. **Describe your landing page** in the chat
   - Example: "Create a modern SaaS landing page with a hero section, features, and pricing"

2. **AI generates code** using the `create_html` tool
   - Watch the code appear in the editor
   - See live preview on the right

3. **Request changes** naturally
   - "Make the background gradient purple"
   - "Add a contact form"

4. **Deploy to Netlify** when ready
   - "Deploy this to Netlify"
   - Get instant public URL

## 🛠️ Tools Available to Agent

### create_html
Creates new landing page with HTML/CSS/JS in a single file.

### edit_code
Modifies existing code (HTML, CSS, or JS sections).

### get_code
Retrieves current code from a project.

### deploy_to_netlify
Deploys project to Netlify and returns public URL.

## 📁 Project Structure

```
landing_maker/
├── server/
│   ├── agents/
│   │   ├── landingWorkflow.ts    # Main agent workflow
│   │   └── tools/
│   │       ├── fileSystem.ts      # File operations
│   │       └── netlifyDeploy.ts   # Deployment
│   ├── api/
│   │   ├── chat.ts                # SSE streaming endpoint
│   │   └── preview.ts             # Preview & code retrieval
│   └── index.ts                   # Express server
├── src/
│   ├── components/
│   │   ├── Chat.tsx               # Chat interface
│   │   ├── Editor.tsx             # CodeMirror editor
│   │   └── Preview.tsx            # iframe preview
│   ├── hooks/
│   │   └── useAgentStream.ts      # SSE hook
│   └── App.tsx                    # Main layout
├── projects/                      # Generated landing pages
└── CLAUDE.md                      # Project documentation
```

## 🔧 Tech Stack

- **Backend**: Express, LlamaIndex, OpenAI
- **Frontend**: Preact, Vite, CodeMirror, Tailwind CSS
- **AI**: GPT-4o-mini (fast, cost-effective)
- **Deploy**: Netlify CLI

## 🎨 Design Philosophy

- **Modern patterns**: Agent Workflows (2025 LlamaIndex best practices)
- **Lightweight**: Preact (3KB) instead of React
- **Simple scope**: Landing pages only (not full-stack apps)
- **Real deployment**: Instant Netlify URLs (not just previews)

## 📝 Example Prompts

```
"Create a minimalist portfolio landing page with dark mode"

"Build a SaaS landing page with hero, features, pricing, and CTA"

"Make a product launch page with countdown timer"

"Create a newsletter signup page with gradient background"

"Add a testimonials section with 3 cards"

"Deploy this to Netlify"
```

## 🛡️ Safety Features

- Request timeout (60s)
- Max chunks limit (2000)
- Content validation
- Proper error handling

## 📚 Learn More

- [LlamaIndex Agent Workflows](https://docs.llamaindex.ai/en/stable/module_guides/workflow/)
- [Preact Documentation](https://preactjs.com/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

## 📄 License

MIT

---

Built with ❤️ using modern 2025 patterns
