# 🚀 Local LLM Setup - Ollama + ngrok

This folder contains scripts and configuration for running Ollama locally and exposing it via ngrok for remote access (e.g., Vercel deployment).

## Quick Start

### First Time Setup (5 minutes)

```bash
# Make setup script executable
chmod +x setup-auto-start.sh

# Run setup (installs LaunchAgents for auto-start)
bash setup-auto-start.sh

# Get your ngrok URL
bash get-ngrok-url.sh
```

That's it! Services will now auto-start on system boot.

## Scripts & Files

### 📜 Scripts (Run these)

| Script | Purpose |
|--------|---------|
| `setup-auto-start.sh` | **First-time setup**: Creates LaunchAgents for auto-start |
| `get-ngrok-url.sh` | Get current ngrok tunnel URL |
| `update-env-ngrok.sh` | Auto-update .env.local with latest ngrok URL |
| `status.sh` | Check status of Ollama, ngrok, and local API |

### ⚙️ Configuration Files (Created by setup)

| File | Purpose |
|------|---------|
| `com.ollama.plist` | LaunchAgent config for Ollama auto-start |
| `com.ngrok.plist` | LaunchAgent config for ngrok auto-start |

### 📖 Documentation

| File | Purpose |
|------|---------|
| `AUTO-START-GUIDE.md` | Detailed auto-start setup & management |
| `run-phi.sh` | Example script for running phi4-mini |

## Common Tasks

### Check Service Status
```bash
bash status.sh
```

### Get ngrok URL (for Vercel)
```bash
bash get-ngrok-url.sh
```

### View Service Logs
```bash
tail -f ~/Library/Logs/ollama-error.log
tail -f ~/Library/Logs/ngrok-error.log
```

### Manually Start/Stop Services
```bash
# Start Ollama
launchctl load ~/Library/LaunchAgents/com.ollama.plist

# Stop Ollama
launchctl unload ~/Library/LaunchAgents/com.ollama.plist

# Start ngrok
launchctl load ~/Library/LaunchAgents/com.ngrok.plist

# Stop ngrok
launchctl unload ~/Library/LaunchAgents/com.ngrok.plist
```

## Architecture

```
Your Mac (localhost)
├── Ollama :11434 (serves phi4-mini model)
└── ngrok tunnel (exposes to internet)
    └── https://abc123.ngrok-free.dev → Vercel uses this
```

## Environment Variables

### Local Development (.env.local)
```
OLLAMA_BASE_URL=http://localhost:11434/v1
```

### Vercel Production (.env.production)
```
OLLAMA_BASE_URL_PROD=https://your-ngrok-url.ngrok-free.dev/v1
```

## Troubleshooting

### Services won't start
1. Check if Ollama is installed:
   ```bash
   which ollama
   ```
2. Check error logs:
   ```bash
   tail -f ~/Library/Logs/ollama-error.log
   ```
3. Try running manually:
   ```bash
   ollama serve
   ```

### ngrok won't connect
1. Check internet connection
2. Verify auth token:
   ```bash
   grep NGROK_AUTHTOKEN local-llm/com.ngrok.plist
   ```
3. Check error logs:
   ```bash
   tail -f ~/Library/Logs/ngrok-error.log
   ```

### Can't get ngrok URL
1. Check if ngrok is running:
   ```bash
   pgrep ngrok
   ```
2. Wait a few seconds, ngrok needs time to establish tunnel
3. Try manually:
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

## Important Notes

- ⚠️ **ngrok URL changes on restart** - Get latest URL after each restart with `bash get-ngrok-url.sh`
- 📌 **Update Vercel env vars** - When ngrok URL changes, update in Vercel dashboard
- 🔐 **Auth token is pre-configured** - Already included in `com.ngrok.plist`
- 🚀 **Services auto-start** - After setup, they start automatically on system boot
- 📊 **Logs are in ~/Library/Logs/** - Check there for debugging

## Next Steps

1. Run setup: `bash setup-auto-start.sh`
2. Verify services: `bash status.sh`
3. Get ngrok URL: `bash get-ngrok-url.sh`
4. Update Vercel with ngrok URL
5. Deploy to Vercel: `git push origin main`

## More Information

- 📖 Full deployment guide: `../VERCEL-DEPLOYMENT.md`
- 📖 Full quick-start: `../QUICK-START.sh`
- 🌐 Ollama docs: https://ollama.ai
- 🌐 ngrok docs: https://ngrok.com/docs

---

**Questions?** Check AUTO-START-GUIDE.md for detailed setup & troubleshooting.
