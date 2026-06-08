#!/bin/bash

# Quick-start guide for setting up Belavision4 with Ollama + ngrok
# This script provides a step-by-step walkthrough

set -e

echo "🎯 Belavision4 Quick-Start Setup"
echo "=================================="
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found"
    echo "   Install from: https://ollama.ai"
    exit 1
fi
echo "✓ Ollama installed"

if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found"
    echo "   Install with: brew install ngrok"
    exit 1
fi
echo "✓ ngrok installed"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    echo "   Install Node.js from: https://nodejs.org"
    exit 1
fi
echo "✓ npm installed"

echo ""
echo "✅ All prerequisites found!"
echo ""

# Step 2: Install dependencies
echo "📋 Step 2: Installing project dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Step 3: Setup auto-start
echo "📋 Step 3: Setting up Ollama + ngrok auto-start..."
echo ""
echo "This will create LaunchAgents to automatically start services"
echo "on system boot. Services will start immediately."
echo ""

chmod +x local-llm/setup-auto-start.sh
bash local-llm/setup-auto-start.sh

echo ""
echo "✅ Auto-start setup complete!"
echo ""

# Step 4: Get ngrok URL
echo "📋 Step 4: Getting ngrok tunnel URL..."
echo ""

sleep 3

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  ngrok is starting. Wait a moment and run:"
    echo "   bash local-llm/get-ngrok-url.sh"
else
    echo "✓ ngrok tunnel URL: $NGROK_URL"
    echo ""
    echo "🔌 Ollama API URL: $NGROK_URL/v1"
    echo ""
fi

echo ""
echo "📋 Step 5: Vercel Deployment Setup"
echo ""
echo "To deploy to Vercel with Ollama support:"
echo ""
echo "1️⃣  Get latest ngrok URL:"
echo "    bash local-llm/get-ngrok-url.sh"
echo ""
echo "2️⃣  Set Vercel environment variables:"
echo "    - Go to: https://vercel.com/dashboard"
echo "    - Select: belavision4 project"
echo "    - Settings → Environment Variables → Production"
echo "    - Add:"
echo "      Name:  OLLAMA_BASE_URL"
echo "      Value: <ngrok-url>/v1"
echo "    - Add:"
echo "      Name:  APP_URL"
echo "      Value: https://belavision4.vercel.app"
echo ""
echo "3️⃣  Deploy to Vercel:"
echo "    git push origin main"
echo "    (or: vercel --prod)"
echo ""

echo ""
echo "📋 Step 6: Local Development"
echo ""
echo "Start the development server:"
echo "    npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""

echo ""
echo "✅ Setup Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Important Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Get ngrok URL:"
echo "  bash local-llm/get-ngrok-url.sh"
echo ""
echo "View service logs:"
echo "  tail -f ~/Library/Logs/ollama-error.log"
echo "  tail -f ~/Library/Logs/ngrok-error.log"
echo ""
echo "Start development:"
echo "  npm run dev"
echo ""
echo "Check service status:"
echo "  pgrep -x ollama && echo '✓ Ollama' || echo '✗ Ollama'"
echo "  pgrep -x ngrok && echo '✓ ngrok' || echo '✗ ngrok'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full documentation: See VERCEL-DEPLOYMENT.md"
echo "📖 Auto-start guide: See local-llm/AUTO-START-GUIDE.md"
echo ""
