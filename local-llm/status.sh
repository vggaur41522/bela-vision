#!/bin/bash

# Status and management script for Belavision4 services
# Usage: bash local-llm/status.sh

echo "🔍 Belavision4 Service Status"
echo "========================================"
echo ""

# Check Ollama
echo "📦 Ollama Status:"
if pgrep -x "ollama" > /dev/null; then
    echo "   ✅ Running"
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | head -3)
        echo "   Available models:"
        echo "$MODELS" | sed 's/^/      - /'
    fi
else
    echo "   ❌ Not running"
    echo ""
    echo "   Start with:"
    echo "   launchctl load ~/Library/LaunchAgents/com.ollama.plist"
fi

echo ""

# Check ngrok
echo "🌐 ngrok Status:"
if pgrep -x "ngrok" > /dev/null; then
    echo "   ✅ Running"
    
    # Try to get tunnel URL
    RESPONSE=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)
    if [ ! -z "$RESPONSE" ]; then
        PUBLIC_URL=$(echo "$RESPONSE" | grep -o '"public_url":"https[^"]*"' | head -1 | cut -d'"' -f4)
        if [ ! -z "$PUBLIC_URL" ]; then
            echo "   Tunnel URL: $PUBLIC_URL"
            echo "   Ollama URL: $PUBLIC_URL/v1"
        fi
    fi
else
    echo "   ❌ Not running"
    echo ""
    echo "   Start with:"
    echo "   launchctl load ~/Library/LaunchAgents/com.ngrok.plist"
fi

echo ""

# Check local API
echo "🚀 Local API Status:"
if curl -s http://localhost:3000/api/analyze > /dev/null 2>&1; then
    echo "   ✅ API responding"
else
    echo "   ❌ API not responding (start with: npm run dev)"
fi

echo ""
echo "📝 Environment:"
if [ -f .env.local ]; then
    echo "   .env.local:"
    grep OLLAMA .env.local | sed 's/^/      /'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Quick Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Get current ngrok URL:"
echo "  bash local-llm/get-ngrok-url.sh"
echo ""
echo "View logs:"
echo "  tail -f ~/Library/Logs/ollama-error.log"
echo "  tail -f ~/Library/Logs/ngrok-error.log"
echo ""
echo "Restart services:"
echo "  launchctl unload ~/Library/LaunchAgents/com.ollama.plist"
echo "  launchctl unload ~/Library/LaunchAgents/com.ngrok.plist"
echo "  sleep 2"
echo "  launchctl load ~/Library/LaunchAgents/com.ollama.plist"
echo "  launchctl load ~/Library/LaunchAgents/com.ngrok.plist"
echo ""
echo "Start dev server:"
echo "  npm run dev"
echo ""
