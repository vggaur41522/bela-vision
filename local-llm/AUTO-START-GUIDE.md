# 🚀 Ollama + ngrok Auto-Start Setup Guide

This guide helps you set up Ollama and ngrok to automatically start when your Mac boots up, allowing Vercel to access your local Ollama instance via ngrok's public tunnel.

## Prerequisites

1. **Ollama installed** - Download from https://ollama.ai
2. **ngrok installed** - `brew install ngrok`
3. **ngrok account & auth token** - Already configured: `3ErwGftIlHgNeT4lK4T0o1EqfJx_6A5n1jRirVFuGi18eBgEb`

## Quick Setup (One-Time)

Run this command once from the project directory:

```bash
chmod +x local-llm/setup-auto-start.sh
bash local-llm/setup-auto-start.sh
```

This script will:
- ✅ Check that Ollama and ngrok are installed
- ✅ Create LaunchAgent configuration files
- ✅ Load them to start services immediately
- ✅ Verify both services are running
- ✅ Show you the ngrok tunnel URL

## What Happens After Setup

After the first setup, whenever your Mac restarts:
1. Ollama will automatically start and serve on `http://localhost:11434`
2. ngrok will automatically create a public tunnel to your local Ollama
3. Your Vercel deployment can use the ngrok URL to access Ollama

## Configuration Files

### Local Development (.env.local)
Uses localhost for faster local development:
```
OLLAMA_BASE_URL=http://localhost:11434/v1
```

### Vercel Production (.env.production)
Uses the ngrok public URL:
```
OLLAMA_BASE_URL_PROD=https://your-ngrok-url.ngrok-free.dev/v1
```

## Getting Your ngrok URL

The ngrok URL changes each time ngrok starts. To get your current URL:

```bash
# Option 1: Using the provided script
bash local-llm/get-ngrok-url.sh

# Option 2: Manual curl
curl http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"'
```

## Managing Services

### View Logs
```bash
# Ollama logs
tail -f ~/Library/Logs/ollama.log
tail -f ~/Library/Logs/ollama-error.log

# ngrok logs
tail -f ~/Library/Logs/ngrok.log
tail -f ~/Library/Logs/ngrok-error.log
```

### Start/Stop Services

```bash
# Stop Ollama
launchctl unload ~/Library/LaunchAgents/com.ollama.plist

# Start Ollama
launchctl load ~/Library/LaunchAgents/com.ollama.plist

# Stop ngrok
launchctl unload ~/Library/LaunchAgents/com.ngrok.plist

# Start ngrok
launchctl load ~/Library/LaunchAgents/com.ngrok.plist
```

### Check if Services Are Running

```bash
# Check Ollama
pgrep -x "ollama" && echo "✓ Ollama running" || echo "✗ Ollama not running"

# Check ngrok
pgrep -x "ngrok" && echo "✓ ngrok running" || echo "✗ ngrok not running"
```

## Troubleshooting

### Ollama won't start

1. Check if Ollama is installed:
   ```bash
   which ollama
   ```

2. Check the error log:
   ```bash
   tail -f ~/Library/Logs/ollama-error.log
   ```

3. Try running Ollama manually to see errors:
   ```bash
   ollama serve
   ```

### ngrok won't start

1. Check if ngrok is installed:
   ```bash
   which ngrok
   ```

2. Verify auth token is set:
   ```bash
   grep NGROK_AUTHTOKEN ~/.ngrok2/ngrok.yml
   ```

3. Check the error log:
   ```bash
   tail -f ~/Library/Logs/ngrok-error.log
   ```

### Services keep crashing

- Check disk space: `df -h`
- Check system logs: `log stream --predicate 'process == "launchd"'`
- Manually verify services work:
  ```bash
  ollama serve  # in one terminal
  ngrok http 11434  # in another terminal
  ```

## Vercel Deployment

1. After ngrok is running, get your tunnel URL:
   ```bash
   bash local-llm/get-ngrok-url.sh
   ```

2. In your Vercel project settings, add environment variable:
   ```
   OLLAMA_BASE_URL_PROD=https://your-ngrok-url.ngrok-free.dev/v1
   ```

3. Your Vercel app will use this URL to connect to your local Ollama

## Removing Auto-Start

If you want to disable auto-start:

```bash
launchctl unload ~/Library/LaunchAgents/com.ollama.plist
launchctl unload ~/Library/LaunchAgents/com.ngrok.plist
rm ~/Library/LaunchAgents/com.ollama.plist
rm ~/Library/LaunchAgents/com.ngrok.plist
```

## Architecture

```
Your Mac
├── Ollama (localhost:11434)
│   └── Serves phi4-mini model
├── ngrok tunnel (creates public URL)
│   └── Exposes localhost:11434 publicly
└── Vercel Deployment
    └── Uses ngrok URL via OLLAMA_BASE_URL_PROD
```

## Notes

- ngrok auth token is already configured in the LaunchAgent
- Services use `KeepAlive: true` to automatically restart if they crash
- Logs are stored in `~/Library/Logs/` for easy debugging
- LaunchAgents run at system login, not just user login

---

For more info: [Ollama Docs](https://ollama.ai) | [ngrok Docs](https://ngrok.com)
