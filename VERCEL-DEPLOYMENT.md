# 🚀 Complete Deployment Guide: Belavision4

This guide walks you through deploying your Belavision4 app to Vercel while using Ollama via ngrok.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your MacBook                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┐                                     │
│  │   Ollama      │ (serves phi4-mini)                 │
│  │ :11434        │                                     │
│  └───────┬───────┘                                     │
│          │                                             │
│  ┌───────▼───────────────────┐                         │
│  │   ngrok tunnel            │ (auto-running)         │
│  │ https://xxx.ngrok-free.dev│                         │
│  └───────────────────────────┘                         │
└─────────────────────────────────────────────────────────┘
                      ▲
                      │ (network)
                      │
┌─────────────────────────────────────────────────────────┐
│              Vercel Deployment                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ belavision4.vercel.app                           │  │
│  │                                                   │  │
│  │ API Routes use:                                  │  │
│  │ - OLLAMA_BASE_URL_PROD (ngrok URL)              │  │
│  │ - Connect to your local Ollama via ngrok        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Local Setup (One-Time)

### 1.1 Install Prerequisites

```bash
# Install Ollama
# Download from: https://ollama.ai

# Install ngrok
brew install ngrok

# Verify installations
which ollama
which ngrok
```

### 1.2 Set Up Auto-Start

```bash
cd /path/to/belavision-core

# Make setup script executable
chmod +x local-llm/setup-auto-start.sh

# Run setup (creates LaunchAgents for auto-start)
bash local-llm/setup-auto-start.sh
```

This script will:
- ✅ Verify Ollama and ngrok are installed
- ✅ Create LaunchAgent configurations
- ✅ Start both services immediately
- ✅ Show you the ngrok URL

### 1.3 Get Your ngrok URL

```bash
# Get the current ngrok tunnel URL
bash local-llm/get-ngrok-url.sh

# Output example:
# 🌐 Base URL:     https://abc123.ngrok-free.dev
# 🔌 Ollama URL:   https://abc123.ngrok-free.dev/v1
```

**Save this URL** - you'll need it for Vercel.

## Step 2: Vercel Deployment

### 2.1 Prerequisites

- Vercel account (https://vercel.com)
- Project connected to your GitHub repo (belavision4)

### 2.2 Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **belavision4** project
3. Click **Settings** → **Environment Variables**
4. Add these variables for **Production**:

```
Variable Name: OLLAMA_BASE_URL
Value: https://your-ngrok-url.ngrok-free.dev/v1

Variable Name: APP_URL
Value: https://belavision4.vercel.app
```

**Replace `your-ngrok-url` with your actual ngrok URL from Step 1.3**

### 2.3 Deploy to Vercel

```bash
# Option 1: Via Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: Via GitHub
# Push to GitHub, Vercel auto-deploys
git add .
git commit -m "Update to use Ollama via ngrok"
git push origin main
```

## Step 3: Test the Deployment

### 3.1 Test Local First

```bash
# Start development server
npm run dev

# In browser: http://localhost:3000
# Test analysis and simulation features
# Should work with local Ollama (:11434)
```

### 3.2 Test Production Deployment

1. Go to https://belavision4.vercel.app
2. Try the analysis feature
3. Check Vercel logs if issues:
   ```bash
   vercel logs belavision4 --prod
   ```

## Step 4: Managing ngrok URL Updates

**Important**: ngrok URL changes each time you restart ngrok or your Mac.

### Option A: Automatic Updates (Recommended)

After restarting your Mac or ngrok:

```bash
# Get new ngrok URL
bash local-llm/get-ngrok-url.sh

# Manually update in Vercel dashboard:
# Settings → Environment Variables → Update OLLAMA_BASE_URL
```

### Option B: Static ngrok URL (Premium ngrok)

For a permanent URL, upgrade to ngrok's paid plan:
1. Visit https://dashboard.ngrok.com/
2. Enable "Reserved Domains"
3. Create a static domain (e.g., `belavision4.ngrok-free.dev`)
4. Update your Vercel environment variable once

## Monitoring & Troubleshooting

### Check Service Status

```bash
# Check if services are running
pgrep -x "ollama" && echo "✓ Ollama" || echo "✗ Ollama"
pgrep -x "ngrok" && echo "✓ ngrok" || echo "✗ ngrok"

# View logs
tail -f ~/Library/Logs/ollama-error.log
tail -f ~/Library/Logs/ngrok-error.log
```

### Local Development Issues

```bash
# Test Ollama directly
curl http://localhost:11434/api/tags

# Test API endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"mode":"individual","profiles":[{"name":"John","dob":"1990-01-01","calc":{"driverNumber":1,"conductorNumber":2,"kuaNumber":3,"nameNumber":4,"counts":{}}}]}'
```

### Production (Vercel) Issues

```bash
# Check Vercel logs
vercel logs belavision4 --prod --follow

# Check if ngrok tunnel is alive
curl https://your-ngrok-url.ngrok-free.dev/v1/models

# Restart services on Mac
bash local-llm/get-ngrok-url.sh
# If URL changed, update Vercel environment variables
```

## Daily Workflow

### When You Start Your Mac

1. **Auto-start services**: Ollama and ngrok start automatically via LaunchAgents
2. **Get ngrok URL**: 
   ```bash
   bash local-llm/get-ngrok-url.sh
   ```
3. **Check if URL changed**: If different from yesterday, update Vercel
4. **Develop locally**: 
   ```bash
   npm run dev
   ```
5. **Deploy when ready**:
   ```bash
   git add .
   git commit -m "your message"
   git push origin main  # Auto-deploys to Vercel
   ```

### When You Restart Your Mac

Same as above - services auto-start!

## Quick Reference Commands

```bash
# Setup
chmod +x local-llm/setup-auto-start.sh
bash local-llm/setup-auto-start.sh

# Get ngrok URL
bash local-llm/get-ngrok-url.sh

# View current env vars
cat .env.local
cat .env.production

# Stop services
launchctl unload ~/Library/LaunchAgents/com.ollama.plist
launchctl unload ~/Library/LaunchAgents/com.ngrok.plist

# Start services
launchctl load ~/Library/LaunchAgents/com.ollama.plist
launchctl load ~/Library/LaunchAgents/com.ngrok.plist

# View logs
tail -f ~/Library/Logs/ollama-error.log
tail -f ~/Library/Logs/ngrok-error.log

# Test local Ollama
curl http://localhost:11434/api/tags

# Test Vercel deployment
curl https://belavision4.vercel.app/api/analyze
```

## Environment Variable Summary

| Env Var | Local Dev | Vercel | Example |
|---------|-----------|--------|---------|
| `OLLAMA_BASE_URL` | ✅ | ❌ | `http://localhost:11434/v1` |
| `OLLAMA_BASE_URL_PROD` | ❌ | ✅ | `https://abc123.ngrok-free.dev/v1` |
| `APP_URL` | ✅ | ✅ | `https://belavision4.vercel.app` |

## FAQ

**Q: My ngrok URL keeps changing!**
A: This is normal with free ngrok. Either:
- Manually update Vercel env vars after each restart
- Upgrade to ngrok premium for a static URL

**Q: Services won't auto-start after Mac restart**
A: Run `bash local-llm/setup-auto-start.sh` again

**Q: Vercel deployment can't reach Ollama**
A: Check:
1. Is ngrok running? `pgrep ngrok`
2. Is Ollama running? `pgrep ollama`
3. Is ngrok URL correct in Vercel?
4. Run `bash local-llm/get-ngrok-url.sh` to get latest URL

**Q: Can I make ngrok URL permanent?**
A: Yes, with ngrok premium plan (includes reserved domains)

**Q: Do I need to deploy every time I restart my Mac?**
A: No! Services auto-start. Only deploy when you change code.

---

**Need help?**
- Ollama: https://ollama.ai/docs
- ngrok: https://ngrok.com/docs
- Vercel: https://vercel.com/docs
