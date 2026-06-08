import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server";

// Use production URL if available (for Vercel deployment via ngrok)
// Default to ngrok URL, fall back to localhost for local development
const baseURL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL_PROD || 'https://impromptu-coach-syrup.ngrok-free.dev/v1' || 'http://localhost:11434/v1';

const client = new OpenAI({
  baseURL,
  apiKey: 'ollama',
});

export async function POST(req: NextRequest) {
  try {
    const { mode, profiles } = await req.json();

    let prompt = "";

    if (mode === 'individual') {
      const p = profiles[0];
      prompt = `
Analyze the following numerology profile based on Lo Shu Grid principles:
Name: ${p.name}
Date of Birth: ${p.dob}
Calculated Numbers:
- Driver Number: ${p.calc.driverNumber}
- Conductor Number: ${p.calc.conductorNumber}
- Kua Number: ${p.calc.kuaNumber}
- Name Number: ${p.calc.nameNumber}

Numbers present in their Lo Shu Grid (including counts):
${JSON.stringify(p.calc.counts, null, 2)}

Instructions:
1. Grid Summary: Explain what series or planes (e.g., Mental, Emotional, Practical) are complete in their Lo Shu grid and what this means for their personality and life.
2. Missing Numbers: Identify which numbers are missing from the grid and explain the effects of these missing numbers.
3. Remedies & Predictions: Suggest practical remedies to improve their grid. Specifically, recommend any changes to their name's spelling (e.g., adding or removing vowels/letters) to introduce the missing numbers and balance the grid. Give other general life advice based on the missing numbers.

Format the response using clean Markdown. Use headings, bullet points, and bold text for readability. Do NOT attempt to draw the Lo Shu Grid using markdown tables or text; the visual grid is already displayed in the UI. Do not output raw JSON.
IMPORTANT: You MUST write the ENTIRE response exclusively in Hindi language.
`;
    } else if (mode === 'couple') {
      const [p1, p2] = profiles;
      prompt = `
Analyze the following couple's numerology profiles based on Lo Shu Grid principles for compatibility:

Person 1: Name: ${p1.name}, DOB: ${p1.dob}
Calculated Numbers: Kua: ${p1.calc.kuaNumber}, Driver: ${p1.calc.driverNumber}, Conductor: ${p1.calc.conductorNumber}, Name: ${p1.calc.nameNumber}
Grid counts: ${JSON.stringify(p1.calc.counts)}

Person 2: Name: ${p2.name}, DOB: ${p2.dob}
Calculated Numbers: Kua: ${p2.calc.kuaNumber}, Driver: ${p2.calc.driverNumber}, Conductor: ${p2.calc.conductorNumber}, Name: ${p2.calc.nameNumber}
Grid counts: ${JSON.stringify(p2.calc.counts)}

Instructions:
1. Individual Briefly: Give a very brief summary of each person's completed series and missing numbers.
2. Relational Dynamics & Compatibility: Based on their Kua, Driver, Conductor, Name numbers, and respective Lo Shu grids, analyze their relational dynamics. Detail their strengths as a couple, communication styles, family life, and financial compatibility.
3. Challenges: What are the potential challenges they might face based on opposing or missing numbers?
4. Actionable Advice & Remedies: Provide actionable advice for improving their bond, including possible name spelling changes for either person to add missing numbers.

Format the response using clean Markdown. Use headings, bullet points, and bold text for readability. Do NOT attempt to draw the Lo Shu Grid using markdown tables or ASCII art; the UI already provides visual representations.
IMPORTANT: You MUST write the ENTIRE response exclusively in Hindi language.
`;
    }

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
