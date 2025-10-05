# 🏗️ Architecture Deep Dive

## 🎯 Core Philosophy

**Landing Maker** sigue el **Agent Workflow pattern puro** de LlamaIndex 2025, inspirado directamente en tu código compartido.

### Key Principles:
1. **Zero Custom Routing**: El modelo AI decide qué tools usar
2. **Single Agent**: Un solo agente con todas las capacidades
3. **Tool-First**: Funcionalidad expuesta como tools, no código imperativo
4. **Streaming by Default**: SSE para experiencia en tiempo real

---

## 🔄 Agent Workflow Pattern

### Patrón del código compartido:

```typescript
// ✅ TU PATRÓN (seguido exactamente)
const agentConfig = {
  llm: createLLM(model, temperature),
  tools: getAllTools(),           // ← Modelo decide
  systemPrompt: buildPrompt(),
  verbose: true
};

const agent = agent(agentConfig);

// Stream con eventos
for await (const event of agent.runStream(message)) {
  if (agentToolCallEvent.include(event)) {
    // Tool ejecutándose
  }
  if (agentStreamEvent.include(event)) {
    // Contenido streaming
  }
}
```

### Aplicado en Landing Maker:

```typescript
// server/agents/landingWorkflow.ts
const allTools = [
  createHtmlTool,      // FunctionTool
  editCodeTool,        // FunctionTool
  getCodeTool,         // FunctionTool
  deployToNetlifyTool, // FunctionTool
];

const agentConfig = {
  llm,
  tools: allTools,    // ← Modelo decide cuándo usarlas
  systemPrompt,
  verbose: true,
};

return agent(agentConfig);
```

**Diferencias con Bolt.new/Dyad:**
- Bolt: Custom routing logic (if/else para tools)
- Dyad: Multiple agents con orquestación manual
- **Landing Maker**: Pure agent pattern ✅

---

## 🛠️ Tools Architecture

### Tool Pattern (LlamaIndex FunctionTool)

```typescript
export const createHtmlTool = FunctionTool.from(
  async ({ projectId, html, css, js }) => {
    // 1. Ejecutar lógica
    const result = await createFile(...);

    // 2. Retornar JSON string (importante!)
    return JSON.stringify({
      success: true,
      message: "✅ Created!",
      projectId,
    });
  },
  {
    name: "create_html",
    description: `Detailed description for AI...`, // ← Modelo lee esto
  }
);
```

### ¿Por qué JSON string return?

LlamaIndex espera que tools retornen **strings** (no objetos).
El agente parsea el JSON y lo usa en su razonamiento.

### Tool Execution Flow:

```
User: "Create landing page"
  ↓
Agent razona: "Necesito create_html tool"
  ↓
agentToolCallEvent: { toolName: "create_html" }
  ↓
Tool ejecuta: createHtmlTool({ projectId: "123", html: "...", ... })
  ↓
Tool retorna: '{"success": true, "projectId": "123"}'
  ↓
Agent razona con resultado
  ↓
agentStreamEvent: { delta: "✅ Landing page created at /preview/123" }
  ↓
Frontend recibe chunks via SSE
```

---

## 🌊 Streaming Architecture

### SSE (Server-Sent Events)

**¿Por qué SSE y no WebSockets?**
- Unidireccional (server → client)
- HTTP compatible (sin protocolo especial)
- Auto-reconnect built-in
- Más simple que WebSockets para nuestro caso

### Backend (Express):

```typescript
// server/api/chat.ts
export async function chatHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const event of streamLandingWorkflow(message)) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);

    if (event.type === "done") {
      res.end();
      break;
    }
  }
}
```

### Frontend (Preact):

```typescript
// src/hooks/useAgentStream.ts
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const event = JSON.parse(line.slice(6));
      // Procesar evento
    }
  }
}
```

### Event Types:

```typescript
type StreamEvent =
  | { type: "chunk"; content: string }      // Texto del agente
  | { type: "tool-start"; tool: string }    // Tool ejecutándose
  | { type: "done"; metadata: any }         // Completado
  | { type: "error"; content: string };     // Error
```

---

## 🎨 UI Architecture

### 3-Panel Layout (Inspired by Dyad/Bolt)

```
┌─────────────┬──────────────┬──────────────┐
│    Chat     │    Editor    │   Preview    │
│             │              │              │
│  Streaming  │  CodeMirror  │   iframe     │
│    SSE      │  Tabs: HTML  │   Live       │
│             │  CSS/JS      │   Reload     │
└─────────────┴──────────────┴──────────────┘
```

### State Management:

**Preact Signals** (no Redux/Zustand):
```typescript
// Simple y reactivo
const [messages, setMessages] = useState<Message[]>([]);
const [currentResponse, setCurrentResponse] = useState("");
const [isStreaming, setIsStreaming] = useState(false);
```

### Component Communication:

```
App (root)
 ├─ useAgentStream() ← Hook compartido
 ├─ Chat ← Recibe messages, isStreaming
 ├─ Editor ← Recibe projectId, fetches code
 └─ Preview ← Recibe projectId, renders iframe
```

**Pattern**: Unidirectional data flow (como React)

---

## 💾 File System

### Project Storage:

```
projects/
  └── [projectId]/
      └── index.html   ← Single-file landing page
```

### ¿Por qué single-file?

1. **Simplicidad**: Fácil de servir y deployar
2. **Netlify friendly**: No build step necesario
3. **Inline assets**: CSS/JS embebidos
4. **Fast preview**: Un solo archivo a leer

### File Structure:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS aquí */
  </style>
</head>
<body>
  <!-- HTML aquí -->
  <script>
    // JS aquí
  </script>
</body>
</html>
```

---

## 🚀 Deployment Flow

### Netlify CLI Integration:

```typescript
// server/agents/tools/netlifyDeploy.ts
const deployCommand = `cd "${projectPath}" && netlify deploy --prod --auth ${token} --dir .`;

const { stdout } = await execAsync(deployCommand);

// Parse URL from output
const url = stdout.match(/Website URL:\s+(https:\/\/[^\s]+)/)[1];
```

### Deploy Stages:

1. User: "Deploy to Netlify"
2. Agent: Ejecuta `deploy_to_netlify` tool
3. Tool: Llama Netlify CLI programmatically
4. Netlify: Sube archivos, asigna dominio
5. Tool: Retorna URL pública
6. Agent: Streamea respuesta con URL
7. Frontend: Muestra link clickeable

---

## 🛡️ Safety & Limits

### Protecciones implementadas (de tu código):

```typescript
const MAX_CHUNKS = 2000;
const MAX_DURATION_MS = 60000;

if (chunkCount >= MAX_CHUNKS) {
  yield { type: "error", content: "Response too large" };
  break;
}

if (elapsed > MAX_DURATION_MS) {
  yield { type: "error", content: "Timeout" };
  break;
}
```

### Token Limits:

```typescript
const config = {
  maxCompletionTokens: 2000,  // Suficiente para código
  timeout: 60000,
  maxRetries: 3,
};
```

---

## 🔮 Future Enhancements

### Phase 2 (Post-MVP):
1. **Conversation Memory**: `createMemory()` para contexto
2. **Multi-project**: Gestionar múltiples landing pages
3. **Templates**: Library de templates predefinidos
4. **Asset Upload**: Imágenes, iconos, logos
5. **Custom domains**: Netlify custom domains
6. **Analytics**: Track usage, popular features

### Phase 3 (Advanced):
1. **Collaboration**: Multi-user editing
2. **Version Control**: Git integration
3. **A/B Testing**: Multiple variants
4. **SEO Tools**: Meta tags, sitemap generation
5. **Component Library**: Reusable sections

---

## 📊 Tech Stack Rationale

| Tech | Why? |
|------|------|
| **LlamaIndex** | Pure agent workflows, mejor que LangChain para tools |
| **Express** | Simple, probado, SSE-friendly |
| **Preact** | 3KB vs 45KB (React), misma API |
| **Vite** | Fast HMR, ESM nativo |
| **CodeMirror** | Lightweight vs Monaco (100KB vs 2MB) |
| **Tailwind** | Utility-first, fast prototyping |
| **Netlify** | Zero-config deploy, instant URLs |

---

## 🎓 Learnings from Your Code

### 1. System Prompt Engineering

```typescript
// Tu patrón: Dynamic prompts basados en tools disponibles
function buildSystemPrompt(hasContextSearch, hasWebSearch) {
  let prompt = basePrompt;

  if (hasContextSearch) {
    prompt += contextSearchInstructions;
  }

  if (hasWebSearch) {
    prompt += webSearchInstructions;
  }

  return prompt;
}
```

Aplicado:
- Detectamos si user tiene Netlify token
- Ajustamos instrucciones de deploy según disponibilidad

### 2. Tool Credits Tracking

```typescript
// Tu patrón: Track costos por tool
const TOOL_CREDITS = {
  'create_html': 1,
  'deploy_to_netlify': 4,
};

creditsUsed += TOOL_CREDITS[toolName] || 1;
```

Listo para implementar billing en Phase 2.

### 3. Streaming Safety

```typescript
// Tu patrón: Multiple safeguards
- Timeout protection
- Max chunks limit
- Content validation
- Error boundaries
```

Todo implementado en `landingWorkflow.ts`.

---

## 🚦 Deployment Checklist

- [x] TypeScript sin errores
- [x] SSE streaming funcional
- [x] Tools correctamente definidos
- [x] Frontend responsive
- [x] Preview auto-refresh
- [x] Netlify integration
- [ ] Production build test
- [ ] Error handling robusto
- [ ] Rate limiting (opcional)
- [ ] Logging & monitoring (opcional)

---

**Built with modern 2025 patterns** 🚀
