import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a world-class AI Content Moderator and Forensic Linguist. 
Analyze the input (text and/or image) for potential safety violations.

CATEGORIES TO EVALUATE:
1. Hate Speech: Attacks on protected groups.
2. Harassment: Targeted bullying or sexual advances.
3. Sexually Explicit: Gratuitous or non-consensual sexual content.
4. Dangerous Content: Promotion of self-harm, violence, or illegal acts.
5. Toxicity: General rudeness or inflammatory language.
6. Insult: Targeted disparagement.

DIRECTIONS:
- Identify the language and provide cultural context.
- Toxicity scores must be 0.0 to 1.0.
- Extract the exact problematic phrases (tokens) in their original language.
- Recommendation: "ALLOW" (0-0.39), "FLAG" (0.4-0.69), "BLOCK" (0.7-1.0).
- Reasoning must be concise and objective.

YOU MUST RETURN VALID JSON.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, image } = req.body || {};
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const parts: any[] = [];
    if (text) {
      parts.push({ text: `Content for moderation: "${text}"` });
    }
    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(',')[1],
        },
      });
      parts.push({ text: "Examine this image for visual abuse or embedded text that violates safety policies." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "Normalized score 0-1" },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                },
                required: ["category", "score"]
              }
            },
            reasoning: { type: Type.STRING },
            flaggedPhrases: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: { type: Type.STRING, enum: ["ALLOW", "FLAG", "BLOCK"] },
            detectedLanguage: { type: Type.STRING },
          },
          required: ["overallScore", "metrics", "reasoning", "flaggedPhrases", "recommendation", "detectedLanguage"]
        }
      }
    });

    const textOut = response.text;
    if (!textOut) return res.status(500).json({ error: "Moderation engine failed to produce a valid response." });
    const result = JSON.parse(textOut);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('moderate api error', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
