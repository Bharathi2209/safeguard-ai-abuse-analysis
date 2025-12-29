
import { AnalysisResult, AnalysisContent } from "../types";

// Client-side wrapper that calls the serverless moderation endpoint.
export const analyzeContent = async (content: AnalysisContent): Promise<AnalysisResult> => {
  const res = await fetch('/api/moderate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moderation API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data as AnalysisResult;
};
