import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server";

// Use production URL if available (for Vercel deployment via ngrok)
// Otherwise fall back to local development URL
const baseURL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL_PROD || 'http://localhost:11434/v1';

const client = new OpenAI({
  baseURL,
  apiKey: 'ollama',
});

export async function POST(req: NextRequest) {
  try {
    const { originalName, newName, originalCounts, newCounts } = await req.json();

    const prompt = `
A user is simulating a name change in numerology (Lo Shu Grid).
Original Name: ${originalName}
New Simulated Name: ${newName}

Original Grid Numbers Present:
${JSON.stringify(originalCounts)}

New Grid Numbers Present:
${JSON.stringify(newCounts)}

Instructions:
1. Compare the new grid with the old grid.
2. What missing numbers were added by this name change? 
3. How will this positively change their life or personality based on Lo Shu principles?
4. Keep it brief. 

Format the response using clean Markdown. Use headings, bullet points, and bold text for readability. Do NOT attempt to draw the Lo Shu Grid using markdown tables or text representations.
IMPORTANT: You MUST write the ENTIRE response exclusively in Hindi language.
`;

    const response = await client.chat.completions.create({
      model: 'phi4-mini:latest',
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Ollama API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
