#!/bin/bash

# Update .env.local with current ngrok URL
# Usage: bash update-env-ngrok.sh

echo "🔄 Updating .env.local with current ngrok URL..."

# Get current ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL. Is ngrok running?"
    exit 1
fi

echo "✅ Found ngrok URL: $NGROK_URL"

# Update .env.local
if grep -q "OLLAMA_BASE_URL_PROD=" .env.local; then
    sed -i '' "s|OLLAMA_BASE_URL_PROD=.*|OLLAMA_BASE_URL_PROD=$NGROK_URL/v1|" .env.local
else
    echo "OLLAMA_BASE_URL_PROD=$NGROK_URL/v1" >> .env.local
fi

echo "✅ Updated .env.local"
echo ""
grep OLLAMA_BASE_URL .env.local
echo ""
