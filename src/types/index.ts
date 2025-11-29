// クレーム対応報告書の型定義

export interface HistoryItem {
  id: string;
  date: string;
  person: string;
  summary: string;
  detail: string;
}

export interface Countermeasure {
  title: string;
  content: string;
  priority: '高' | '中' | '低';
}

export interface VisualSheetData {
  title: string;
  summary: string;
  rootCause: string;
  causeAnalysis: string;
  countermeasures: Countermeasure[];
  expectedEffect: string;
}

export interface ReportData {
  reportDate: string;
  reporter: string;
  logText: string;
  history: HistoryItem[];
  cause: string;
  countermeasure: string;
  visualSheet?: VisualSheetData;
}

export interface AIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
