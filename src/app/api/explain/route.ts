import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (text.length > 10000) {
    return NextResponse.json(
      { error: "Text must be under 10,000 characters" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured" },
      { status: 500 }
    );
  }

  const prompt = `You are an expert at explaining complex topics at different comprehension levels.

Given the following complex text, provide explanations at 3 levels. Return ONLY valid JSON with this exact structure:
{
  "eli5": {
    "explanation": "...",
    "wordCount": <number>,
    "readingLevel": "Grade 1-2"
  },
  "highSchool": {
    "explanation": "...",
    "wordCount": <number>,
    "readingLevel": "Grade 9-10"
  },
  "expert": {
    "explanation": "...",
    "wordCount": <number>,
    "readingLevel": "College/Professional"
  }
}

Rules:
- ELI5: Use very simple words a 5-year-old would understand. Use analogies and comparisons to everyday things. Keep it under 80 words.
- High School: Clear language, explain technical terms when used. Accessible to a teenager. Keep it under 150 words.
- Expert: Concise summary assuming full domain knowledge. Use proper terminology. Keep it under 120 words.
- wordCount must be the actual word count of each explanation.
- Return ONLY the JSON object, no markdown, no code fences.

Complex text to explain:
"""
${text}
"""`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    // Parse the JSON from the response, handling potential markdown fences
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanations" },
      { status: 500 }
    );
  }
}
