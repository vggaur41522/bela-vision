#!/bin/bash

# Comprehensive setup script for Ollama + ngrok auto-start on macOS
# This script will configure LaunchAgents with proper permissions and paths

set -e

echo "🚀 Setting up Ollama + ngrok auto-start..."
echo ""

# Get current username
CURRENT_USER=$(whoami)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if ollama is installed
echo "🔍 Checking for Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first:"
    echo "   https://ollama.ai"
    exit 1
fi
OLLAMA_PATH=$(which ollama)
echo "✓ Found Ollama at: $OLLAMA_PATH"

# Check if ngrok is installed
echo "🔍 Checking for ngrok installation..."
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Please install ngrok first:"
    echo "   brew install ngrok"
    exit 1
fi
NGROK_PATH=$(which ngrok)
echo "✓ Found ngrok at: $NGROK_PATH"

# Create LaunchAgents directory
echo ""
echo "📁 Setting up LaunchAgents directory..."
mkdir -p ~/Library/LaunchAgents
echo "✓ LaunchAgents directory ready"

# Create Ollama LaunchAgent with proper paths
echo ""
echo "📝 Creating Ollama LaunchAgent..."
cat > ~/Library/LaunchAgents/com.ollama.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama</string>
    <key>ProgramArguments</key>
    <array>
        <string>$OLLAMA_PATH</string>
        <string>serve</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>\$HOME/Library/Logs/ollama.log</string>
    <key>StandardErrorPath</key>
    <string>\$HOME/Library/Logs/ollama-error.log</string>
    <key>Umask</key>
    <integer>0022</integer>
</dict>
</plist>
EOF
chmod 644 ~/Library/LaunchAgents/com.ollama.plist
echo "✓ Ollama LaunchAgent created"

# Create ngrok LaunchAgent with proper paths and auth token
echo ""
echo "📝 Creating ngrok LaunchAgent..."
cat > ~/Library/LaunchAgents/com.ngrok.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ngrok</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NGROK_PATH</string>
        <string>http</string>
        <string>11434</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>\$HOME/Library/Logs/ngrok.log</string>
    <key>StandardErrorPath</key>
    <string>\$HOME/Library/Logs/ngrok-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NGROK_AUTHTOKEN</key>
        <string>3ErwGftIlHgNeT4lK4T0o1EqfJx_6A5n1jRirVFuGi18eBgEb</string>
    </dict>
    <key>Umask</key>
    <integer>0022</integer>
</dict>
</plist>
EOF
chmod 644 ~/Library/LaunchAgents/com.ngrok.plist
echo "✓ ngrok LaunchAgent created"

# Load LaunchAgents
echo ""
echo "⚙️  Loading LaunchAgents..."

# Unload if already loaded
launchctl unload ~/Library/LaunchAgents/com.ollama.plist 2>/dev/null || true
launchctl unload ~/Library/LaunchAgents/com.ngrok.plist 2>/dev/null || true

# Load services
launchctl load ~/Library/LaunchAgents/com.ollama.plist
echo "✓ Ollama LaunchAgent loaded"

launchctl load ~/Library/LaunchAgents/com.ngrok.plist
echo "✓ ngrok LaunchAgent loaded"

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start (5 seconds)..."
sleep 5

# Verify services
echo ""
echo "🔍 Verifying services..."

if pgrep -x "ollama" > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama is not running yet. Check: tail -f ~/Library/Logs/ollama-error.log"
fi

if pgrep -x "ngrok" > /dev/null; then
    echo "✅ ngrok is running"
else
    echo "⚠️  ngrok is not running yet. Check: tail -f ~/Library/Logs/ngrok-error.log"
fi

# Show ngrok URL
echo ""
echo "📡 Checking ngrok tunnel URL..."
sleep 2
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$NGROK_URL" ]; then
    echo "⏳ ngrok tunnel not ready yet. Check in a few seconds:"
    echo "   curl http://localhost:4040/api/tunnels"
else
    echo "🌐 ngrok tunnel URL: $NGROK_URL"
    echo ""
    echo "💾 Update your Vercel environment variable:"
    echo "   OLLAMA_BASE_URL_PROD=$NGROK_URL/v1"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Useful commands:"
echo "   • View Ollama logs:   tail -f ~/Library/Logs/ollama-error.log"
echo "   • View ngrok logs:    tail -f ~/Library/Logs/ngrok-error.log"
echo "   • Get ngrok URL:      curl http://localhost:4040/api/tunnels"
echo "   • Stop Ollama:        launchctl unload ~/Library/LaunchAgents/com.ollama.plist"
echo "   • Stop ngrok:         launchctl unload ~/Library/LaunchAgents/com.ngrok.plist"
echo "   • Start Ollama:       launchctl load ~/Library/LaunchAgents/com.ollama.plist"
echo "   • Start ngrok:        launchctl load ~/Library/LaunchAgents/com.ngrok.plist"
echo ""
echo "🔄 Services will automatically start when you restart your Mac!"
