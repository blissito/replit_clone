# 🚀 Landing Maker (Replit Clone)

> 📚 **Proyecto educativo** para talleres de IA y Agentes
>
> 🎓 Aprende a construir este proyecto en: **[www.fixtergeek.com/llamaindex](https://www.fixtergeek.com/llamaindex)**

AI-powered landing page builder con multi-modelo (GPT-4o, Claude) y deployment a Netlify.

## 🎯 Features

- 💬 **Streaming Chat**: SSE real-time con feedback de herramientas
- 🤖 **Multi-modelo**: GPT-5 Nano, GPT-5 Mini, Haiku 3, Sonnet 4.5
- 🧠 **Memoria conversacional**: Edita iterativamente ("cámbialo a rojo")
- 👁️ **Live Preview**: Vista instantánea en iframe
- 🚀 **Netlify Deploy**: Deploy programático (en desarrollo)
- 🎨 **Tool Cards**: Status visual de cada herramienta ejecutada

## 🏗️ Architecture

### Backend: Express + Direct SDKs
- **Multi-SDK**: Anthropic SDK + OpenAI SDK directo (sin LlamaIndex)
- **3 Tools**: create_html, edit_code, deploy_to_netlify
- **SSE Streaming**: Server-Sent Events para feedback en tiempo real
- **File System**: Proyectos en `/projects/{projectId}/index.html`

### Frontend: Vanilla JS + Tailwind
- **Single HTML**: Todo en `public/index.html` (sin build step)
- **Chat + Preview**: 2 paneles lado a lado
- **Tool Cards**: Indicadores visuales de ejecución de herramientas

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
Create `.env` file:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NETLIFY_AUTH_TOKEN=nfp_...  # Optional, for deployment
PORT=3000
```

### 3. Run Development
```bash
# Start server (single command)
pnpm dev
```

### 4. Open App
Open **http://localhost:3000** (todo en un puerto)

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

- **Backend**: Express, Anthropic SDK, OpenAI SDK
- **Frontend**: Vanilla JS, Tailwind CDN (sin build)
- **AI**: Multi-modelo (GPT-4o, GPT-4o-mini, Claude Haiku, Claude Sonnet)
- **Deploy**: Netlify CLI (programático)

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

### Taller Completo
🎓 **[Taller de IA Agents con LlamaIndex](https://www.fixtergeek.com/llamaindex)**

Aprende a construir este proyecto desde cero en nuestro taller interactivo.

### Recursos Técnicos
- [Anthropic SDK](https://docs.anthropic.com/en/api/client-sdks)
- [OpenAI SDK](https://platform.openai.com/docs/api-reference)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

## 🎯 Objetivos Educativos

Este proyecto enseña:
1. **Multi-modelo AI**: Cómo usar diferentes LLMs con la misma interfaz
2. **Tool Calling**: Patrones de function calling con SDKs oficiales
3. **SSE Streaming**: Server-Sent Events para feedback en tiempo real
4. **Conversational Memory**: Mantener contexto entre requests
5. **Error Handling**: Gestión de errores en aplicaciones AI

## 📄 License

MIT

---

🎓 **Proyecto educativo** por [FixterGeek](https://www.fixtergeek.com)
Built with ❤️ para talleres de IA y Desarrollo
