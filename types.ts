
export enum ContentCategory {
  HATE_SPEECH = 'Hate Speech',
  HARASSMENT = 'Harassment',
  SEXUALLY_EXPLICIT = 'Sexually Explicit',
  DANGEROUS_CONTENT = 'Dangerous Content',
  TOXICITY = 'Toxicity',
  INSULT = 'Insult'
}

export interface Metric {
  category: string;
  score: number;
}

export interface AnalysisResult {
  overallScore: number;
  metrics: Metric[];
  reasoning: string;
  flaggedPhrases: string[];
  recommendation: 'ALLOW' | 'FLAG' | 'BLOCK';
  detectedLanguage: string;
}

export interface AnalysisContent {
  text?: string;
  image?: string; // base64
}
