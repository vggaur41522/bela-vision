import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
