ollama serve

# In a new terminal, test it
curl http://localhost:11434/api/generate -d '{
  "model": "phi4-mini:latest",
  "prompt": "Hello, who are you?",
  "stream": false
}'