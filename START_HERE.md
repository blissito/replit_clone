# 🎯 START HERE - Landing Maker

## ✅ Project Status: COMPLETE & READY

Todo construido en < 2 horas siguiendo tu patrón de Agent Workflows de LlamaIndex.

---

## 🚀 Quick Start (30 seconds)

### 1. Start Both Servers
```bash
pnpm dev
```

Esto inicia:
- **Backend**: http://localhost:3000 (Express + LlamaIndex Agent)
- **Frontend**: http://localhost:5173 (Vite + Preact)

### 2. Open App
Navega a: **http://localhost:5173**

### 3. Try it!
```
Create a modern landing page for a SaaS product
```

---

## 📂 Documentación

| File | Description |
|------|-------------|
| [README.md](./README.md) | Full project documentation |
| [QUICKSTART.md](./QUICKSTART.md) | Quick start guide with examples |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deep dive into architecture |
| [TEST_PROMPTS.md](./TEST_PROMPTS.md) | Test prompts for validation |
| [CLAUDE.md](./CLAUDE.md) | Project vision & patterns |

---

## 🏗️ What's Built

### ✅ Backend (Express + LlamaIndex)
- [x] **Agent Workflow** siguiendo tu patrón exacto
- [x] 4 Tools: `create_html`, `edit_code`, `get_code`, `deploy_to_netlify`
- [x] SSE Streaming API (`/api/chat`)
- [x] Preview & Code endpoints
- [x] Netlify deployment integration

### ✅ Frontend (Preact + Vite)
- [x] 3-Panel Layout: Chat | Editor | Preview
- [x] CodeMirror con tabs (HTML/CSS/JS)
- [x] Live iframe preview con auto-refresh
- [x] SSE streaming hook
- [x] Tailwind CSS styling
- [x] Responsive design

### ✅ Features
- [x] Real-time streaming chat
- [x] Autonomous tool selection by AI
- [x] Live code preview
- [x] One-click Netlify deploy
- [x] Project persistence
- [x] TypeScript without errors

---

## 🎯 Key Patterns Implemented

### 1. Pure Agent Workflow (tu patrón)
```typescript
const agentConfig = {
  llm: createLLM(),
  tools: allTools,        // ← AI decide qué usar
  systemPrompt,
  verbose: true,
};

const agent = agent(agentConfig);
```

### 2. SSE Streaming
```typescript
for await (const event of agent.runStream(message)) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}
```

### 3. LlamaIndex FunctionTool
```typescript
export const createHtmlTool = FunctionTool.from(
  async ({ projectId, html, css, js }) => {
    // Logic
    return JSON.stringify({ success: true, ... });
  },
  { name: "create_html", description: "..." }
);
```

---

## 🔧 Environment Setup

Ya tienes tu `.env` configurado con:
- ✅ `OPENAI_API_KEY`
- ✅ `NETLIFY_AUTH_TOKEN`

Todo listo para deployar!

---

## 🧪 Test Flow

1. **Create**: `"Create a landing page for TaskFlow"`
   - Agent usa `create_html` tool
   - Código aparece en editor
   - Preview renderiza live

2. **Edit**: `"Make the background purple"`
   - Agent usa `edit_code` tool
   - Preview se actualiza

3. **Deploy**: `"Deploy to Netlify"`
   - Agent usa `deploy_to_netlify` tool
   - Retorna URL pública

---

## 📊 Tech Stack

| Layer | Tech |
|-------|------|
| **AI** | LlamaIndex, OpenAI GPT-4o-mini |
| **Backend** | Express, TypeScript |
| **Frontend** | Preact, Vite, Tailwind |
| **Editor** | CodeMirror |
| **Deploy** | Netlify CLI |

---

## 🎨 UI Preview

```
┌─────────────┬──────────────┬──────────────┐
│    Chat     │    Editor    │   Preview    │
│             │              │              │
│  Streaming  │  CodeMirror  │   iframe     │
│    SSE      │  HTML/CSS/JS │   Live       │
│             │              │              │
└─────────────┴──────────────┴──────────────┘
```

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check port
lsof -i :3000

# Restart
pkill -f "tsx watch"
pnpm dev:server
```

### Frontend won't compile?
```bash
# Clear cache
rm -rf node_modules/.vite
pnpm dev:client
```

### No preview?
- Check console for errors
- Click "Refresh" button
- Verify projectId extraction

---

## 🔮 Next Steps (Post-MVP)

Phase 2 ideas:
- [ ] Conversation memory (`createMemory()`)
- [ ] Multi-project management
- [ ] Template library
- [ ] Asset upload
- [ ] Custom Netlify domains
- [ ] Usage analytics

---

## 🎓 Learnings

### From Your Code:
1. ✅ **Pure agent pattern** > custom routing
2. ✅ **Dynamic system prompts** based on tools
3. ✅ **Safety limits**: timeouts, max chunks
4. ✅ **Tool credits** for billing tracking
5. ✅ **Streaming events** for UX

### Modern 2025 Patterns:
1. ✅ **Agent Workflows** > LangChain
2. ✅ **SSE** > WebSockets (para este caso)
3. ✅ **Preact** > React (3KB vs 45KB)
4. ✅ **Vite** > Webpack
5. ✅ **Single-file deploys** > build complexity

---

## 💡 Pro Tips

1. **Specific prompts** = better results
2. **Iterate incrementally** instead of big changes
3. **Test mobile** - preview is responsive
4. **Deploy early** to catch issues
5. **Check Network tab** to see SSE streaming

---

## 🎉 You're Ready!

```bash
pnpm dev
```

Open http://localhost:5173 and start building! 🚀

---

**Questions?** Check [ARCHITECTURE.md](./ARCHITECTURE.md) for deep dive.

**Testing?** See [TEST_PROMPTS.md](./TEST_PROMPTS.md) for examples.

Built with ❤️ following modern 2025 patterns.
