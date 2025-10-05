# 🚀 Quick Start Guide

## Setup (2 minutes)

### 1. Configure Environment
Edit `.env` file:
```bash
OPENAI_API_KEY=sk-...  # ✅ Already configured!
NETLIFY_AUTH_TOKEN=    # Optional - get from https://app.netlify.com/user/applications
PORT=3000
```

### 2. Start Development Servers
```bash
pnpm dev
```

This starts:
- **Backend** on http://localhost:3000 (Express + Agent)
- **Frontend** on http://localhost:5173 (Vite + Preact)

### 3. Open Browser
Navigate to: http://localhost:5173

## 💬 Example Prompts

### Basic Landing Page
```
Create a modern landing page for a SaaS product called "CloudSync"
with a hero section, features, and a call-to-action button
```

### Specific Design
```
Build a dark-themed portfolio landing page with:
- Hero with gradient background
- About me section
- Project showcase with 3 cards
- Contact section with social links
```

### Modifications
```
Make the background a purple gradient
Add smooth scroll animations
Change the CTA button to green
```

### Deploy
```
Deploy this to Netlify
```

## 🔍 How It Works

1. **You type** a description in the chat
2. **AI generates** complete HTML/CSS/JS using tools
3. **Code appears** in the middle panel (CodeMirror)
4. **Preview renders** in the right panel (live iframe)
5. **Deploy command** pushes to Netlify (instant URL)

## 🛠️ Agent Tools

The AI has access to 4 tools and decides when to use them:

| Tool | Description |
|------|-------------|
| `create_html` | Creates new landing page with unique ID |
| `edit_code` | Modifies HTML/CSS/JS sections |
| `get_code` | Retrieves current code |
| `deploy_to_netlify` | Deploys to Netlify, returns URL |

## 📂 Project Files

Generated landing pages are stored in:
```
projects/
  └── [projectId]/
      └── index.html
```

Each project gets a unique ID (timestamp-based).

## 🐛 Troubleshooting

### Backend won't start
- Check `OPENAI_API_KEY` is set in `.env`
- Make sure port 3000 is available

### Frontend won't start
- Make sure port 5173 is available
- Run `pnpm install` again

### Preview not updating
- Click "Refresh" button in preview panel
- Auto-refresh every 3 seconds

### Deploy fails
- Add `NETLIFY_AUTH_TOKEN` to `.env`
- Get token from: https://app.netlify.com/user/applications
- Install Netlify CLI globally: `npm i -g netlify-cli`

## 🎯 Pro Tips

1. **Be specific**: More details = better results
2. **Iterate**: Start simple, then add features
3. **Use examples**: "Like Apple.com but for [X]"
4. **Test mobile**: Preview is responsive
5. **Deploy early**: Test on real URL

## 📚 Next Steps

- Read [CLAUDE.md](./CLAUDE.md) for architecture details
- Check [README.md](./README.md) for full documentation
- Explore `server/agents/` to see the Agent Workflow
- Customize system prompt in `landingWorkflow.ts`

---

Happy building! 🎉
