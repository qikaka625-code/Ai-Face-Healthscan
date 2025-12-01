export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalysisData {
  score: number;
  conclusion: string;
  diagnosis: string;
  therapy: string;
}

export interface AnalysisResult {
  data: AnalysisData | null;
}

export interface ImageFile {
  data: string; // Base64
  mimeType: string;
}

export type Language = 'zh' | 'vi';
