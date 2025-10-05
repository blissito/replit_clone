# 🛠️ Comandos Útiles

## 🚀 Development

```bash
# Start both servers (recommended)
pnpm dev

# Start backend only (Express + Agent)
pnpm dev:server

# Start frontend only (Vite + Preact)
pnpm dev:client
```

## 🏗️ Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🧪 Testing

```bash
# TypeScript type check
pnpm tsc --noEmit

# Test server health
curl http://localhost:3000/health

# Test chat endpoint (SSE)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a simple landing page"}'
```

## 🐛 Debugging

```bash
# Check running processes
lsof -i :3000  # Backend
lsof -i :5173  # Frontend

# Kill processes
pkill -f "tsx watch"    # Backend
pkill -f "vite"         # Frontend

# View server logs
tail -f /tmp/server.log

# Clear Vite cache
rm -rf node_modules/.vite
```

## 📂 Project Management

```bash
# List generated projects
ls -la projects/

# View project HTML
cat projects/[projectId]/index.html

# Delete all projects
rm -rf projects/*

# Create example project manually
mkdir -p projects/example
echo "<html>...</html>" > projects/example/index.html
```

## 🚀 Netlify Deployment

```bash
# Login to Netlify (if not configured)
netlify login

# Manual deploy from project folder
cd projects/[projectId]
netlify deploy --prod

# List Netlify sites
netlify sites:list

# Delete Netlify site
netlify sites:delete
```

## 🔧 Maintenance

```bash
# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated

# Install specific version
pnpm add llamaindex@latest

# Reinstall all
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📊 Monitoring

```bash
# Watch server logs in real-time
pnpm dev:server | tee server.log

# Monitor file changes
watch -n 1 'ls -lh projects/'

# Check API response times
time curl -s http://localhost:3000/health

# Monitor memory usage
ps aux | grep tsx
```

## 🎨 Frontend Development

```bash
# Access Vite dev server
open http://localhost:5173

# Check bundle size
pnpm build && du -sh dist/

# Analyze bundle
pnpm add -D rollup-plugin-visualizer
# Then check bundle stats after build
```

## 🛡️ Security

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Update only security patches
pnpm update --latest
```

## 📝 Git Workflow

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: Landing Maker MVP"

# Create branch for new feature
git checkout -b feature/conversation-memory

# Push to remote
git remote add origin <your-repo>
git push -u origin main
```

## 🔍 Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias lm-dev="cd ~/landing_maker && pnpm dev"
alias lm-server="cd ~/landing_maker && pnpm dev:server"
alias lm-client="cd ~/landing_maker && pnpm dev:client"
alias lm-build="cd ~/landing_maker && pnpm build"
alias lm-clean="cd ~/landing_maker && rm -rf projects/* node_modules/.vite"
```

## 🚨 Emergency

```bash
# Kill all Node processes (nuclear option)
pkill -9 node

# Clean everything and restart
rm -rf node_modules dist .vite
pnpm install
pnpm dev

# Reset projects
rm -rf projects/*
mkdir -p projects
touch projects/.gitkeep
```

## 📚 Documentation Generation

```bash
# Generate project tree
tree -I 'node_modules|dist' -L 3 > PROJECT_STRUCTURE.txt

# Count lines of code
find . -name '*.ts' -o -name '*.tsx' | xargs wc -l

# List all API endpoints
grep -r "app\.(get|post|put|delete)" server/
```

## 🎯 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both servers |
| `pnpm build` | Production build |
| `curl localhost:3000/health` | Test backend |
| `pkill -f tsx` | Kill backend |
| `rm -rf projects/*` | Clear all projects |
| `netlify deploy --prod` | Deploy to Netlify |

---

**Pro Tip**: Create a `Makefile` for common tasks!

```makefile
.PHONY: dev build clean test

dev:
	pnpm dev

build:
	pnpm build

clean:
	rm -rf node_modules dist projects/* .vite

test:
	pnpm tsc --noEmit
	curl -s http://localhost:3000/health
```

Then use: `make dev`, `make build`, `make clean`
