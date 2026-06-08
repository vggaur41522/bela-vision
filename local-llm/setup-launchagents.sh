#!/bin/bash

# Setup script to configure Ollama and ngrok to run automatically on system startup
# Run this script once: bash setup-launchagents.sh

echo "🚀 Setting up LaunchAgents for Ollama and ngrok..."

# Create LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Install Ollama LaunchAgent
echo "📦 Installing Ollama LaunchAgent..."
cp com.ollama.plist ~/Library/LaunchAgents/com.ollama.plist
chmod 644 ~/Library/LaunchAgents/com.ollama.plist

# Install ngrok LaunchAgent
echo "🌐 Installing ngrok LaunchAgent..."
cp com.ngrok.plist ~/Library/LaunchAgents/com.ngrok.plist
chmod 644 ~/Library/LaunchAgents/com.ngrok.plist

# Load the LaunchAgents
echo "⚙️  Loading LaunchAgents..."
launchctl load ~/Library/LaunchAgents/com.ollama.plist
launchctl load ~/Library/LaunchAgents/com.ngrok.plist

echo "✅ Setup complete!"
echo ""
echo "Verifying services are running..."
sleep 2

# Check if services are running
if pgrep -x "ollama" > /dev/null; then
    echo "✓ Ollama is running"
else
    echo "✗ Ollama is not running - check LaunchAgent"
fi

if pgrep -x "ngrok" > /dev/null; then
    echo "✓ ngrok is running"
else
    echo "✗ ngrok is not running - check LaunchAgent"
fi

echo ""
echo "📝 To view ngrok tunnel URL, run:"
echo "   curl http://localhost:4040/api/tunnels"
echo ""
echo "To stop services:"
echo "   launchctl unload ~/Library/LaunchAgents/com.ollama.plist"
echo "   launchctl unload ~/Library/LaunchAgents/com.ngrok.plist"
