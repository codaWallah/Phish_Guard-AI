
export type AnalysisVerdict = "SAFE" | "SUSPICIOUS" | "DANGEROUS";
export type AnalysisType = "url" | "email";

export interface UrlAdvancedOptions {
  simulationMode?: 'desktop' | 'mobile';
  countryCode?: string;
}

export interface EmailAdvancedOptions {
  extractAllLinks?: boolean;
}

export type AdvancedOptions = UrlAdvancedOptions | EmailAdvancedOptions;


export interface AnalysisCheck {
  check: string;
  description: string;
  score: number; // 0-100, where 100 is most dangerous
}

export interface AnalysisResult {
  verdict: AnalysisVerdict;
  overallScore: number;
  analysis: AnalysisCheck[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: AnalysisType;
  content: string;
  result: AnalysisResult;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}