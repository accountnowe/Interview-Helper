// src/store/types.ts

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum InterviewStatus {
  NOT_STARTED = 'NOT_STARTED',
  COLLECTING_INFO = 'COLLECTING_INFO',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  timeLimit: number; // in seconds
  answer?: string;
  score?: number;
  aiJudgement?: string;
  timeSpent?: number;
  timestamp?: number;
}

export interface CandidateInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Candidate {
  id: string;
  info: CandidateInfo;
  resumeData?: {
    fileName: string;
    uploadedAt: number;
  };
  questions: Question[];
  chatHistory: ChatMessage[];
  status: InterviewStatus;
  currentQuestionIndex: number;
  totalScore: number;
  finalSummary?: string;
  createdAt: number;
  completedAt?: number;
  lastActiveAt: number;
}

export interface InterviewState {
  currentCandidateId: string | null;
  candidates: Record<string, Candidate>;
  isProcessing: boolean;
  error: string | null;
}

export interface RootState {
  interview: InterviewState;
}