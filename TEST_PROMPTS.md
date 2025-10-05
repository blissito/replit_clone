# 🧪 Test Prompts

Use estos prompts para probar el sistema completo.

## 🟢 Test 1: Landing Page Básica

```
Create a simple landing page for a startup called "TaskFlow"
with a hero section, 3 feature cards, and a CTA button
```

**Expected behavior:**
- Agent usa `create_html` tool
- Genera projectId único (timestamp)
- Muestra código en Editor
- Preview renderiza la página
- Chat muestra URL de preview

## 🟡 Test 2: Modificaciones

Después del Test 1:

```
Make the background a gradient from purple to pink
```

**Expected behavior:**
- Agent usa `edit_code` tool
- Modifica solo el CSS
- Preview se actualiza automáticamente

## 🔵 Test 3: Agregar Sección

```
Add a pricing section with 3 plans: Basic ($9), Pro ($29), Enterprise ($99)
```

**Expected behavior:**
- Agent usa `edit_code` tool
- Agrega HTML y CSS para pricing
- Mantiene el resto del código intacto

## 🟠 Test 4: Deploy a Netlify

```
Deploy this to Netlify
```

**Expected behavior:**
- Agent usa `deploy_to_netlify` tool
- Retorna URL pública de Netlify
- URL es clickeable en el chat
- Página funciona en producción

## 🟣 Test 5: Landing Page Compleja

```
Create a modern SaaS landing page for "CloudSync" with:
- Hero section with gradient background and CTA
- Features section with 4 features (icons using emojis)
- Testimonials with 3 customer quotes
- Pricing table with 3 tiers
- Footer with social links
- Smooth scroll animations
- Mobile responsive design
```

**Expected behavior:**
- Agent genera código completo y profesional
- Todos los elementos visuales funcionan
- Responsive design se ve bien en mobile
- Animaciones suaves sin JavaScript pesado

## 🔴 Test 6: Conversación Multi-Turn

```
Turn 1: Create a portfolio landing page for a web developer

Turn 2: Add a projects section with 3 project cards

Turn 3: Make it dark theme with neon accents

Turn 4: Add smooth scroll behavior

Turn 5: Deploy it to Netlify
```

**Expected behavior:**
- Cada modificación mantiene el contexto
- No se reinicia el proyecto
- Cambios son incrementales
- Deploy incluye todos los cambios

## ✅ Success Criteria

Para cada test:
- ✅ No errores en consola
- ✅ Código válido (HTML/CSS/JS)
- ✅ Preview funciona correctamente
- ✅ Editor muestra código formateado
- ✅ SSE streaming sin interrupciones
- ✅ Deploy retorna URL válida

## 🐛 Known Limitations

1. **Single file**: Todo en index.html (no assets externos)
2. **No images**: Solo emojis y CSS art
3. **Vanilla JS**: No frameworks en el output
4. **No persistence**: Refresh pierde el chat (TODO)

## 🚀 Advanced Tests

### Test de Performance

```
Create 5 different landing pages in sequence
```

Verificar: Memory usage, streaming performance

### Test de Edge Cases

```
Create a landing page with 50 sections
```

Verificar: Max tokens handling, chunking

### Test de Netlify

```
Deploy 3 different projects to Netlify
```

Verificar: Multiple deploys, site names, URLs

---

**Pro Tip**: Usa Chrome DevTools Network tab para ver SSE streaming en tiempo real.
