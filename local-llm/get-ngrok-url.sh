#!/bin/bash

# Get the current ngrok tunnel URL
# Usage: bash get-ngrok-url.sh

echo "🔍 Fetching ngrok tunnel URL..."

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "❌ ngrok is not running!"
    echo "Start it with: bash local-llm/setup-auto-start.sh"
    exit 1
fi

# Try to get URL from ngrok API
RESPONSE=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo "❌ Could not connect to ngrok API"
    echo "ngrok might still be starting up. Wait a few seconds and try again."
    exit 1
fi

# Extract the public URL
PUBLIC_URL=$(echo "$RESPONSE" | grep -o '"public_url":"https[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Could not find public URL in ngrok response"
    echo "Raw response: $RESPONSE"
    exit 1
fi

echo ""
echo "✅ Current ngrok tunnel URL:"
echo ""
echo "🌐 Base URL:     $PUBLIC_URL"
echo "🔌 Ollama URL:   $PUBLIC_URL/v1"
echo ""
echo "For Vercel, set:"
echo "OLLAMA_BASE_URL_PROD=$PUBLIC_URL/v1"
echo ""
