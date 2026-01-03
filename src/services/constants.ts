import { QuestionDifficulty } from '../store/types';

export const API_CONFIG = {
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 2000, // Base delay in ms, will be multiplied by attempt number
  EVALUATION_DELAY: 1000,
  SUMMARY_DELAY: 1500,
};

export const GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 200,
};

export const TECHNICAL_TERMS = [
  'component', 'hook', 'state', 'props', 'render', 'virtual dom',
  'async', 'await', 'promise', 'callback', 'closure', 'scope',
  'api', 'rest', 'graphql', 'middleware', 'authentication',
  'optimization', 'performance', 'memoization', 'lazy loading',
  'reconciliation', 'redux', 'context', 'useeffect', 'usestate',
  'jsx', 'typescript', 'node.js', 'express', 'mongodb', 'sql',
  'jwt', 'token', 'cache', 'redis', 'websocket', 'ssr', 'csr',
];

export const CODE_PATTERNS = [
  /```[\s\S]*?```/g,
  /`[^`]+`/g,
  /\b(function|const|let|var|if|else|return|import|export)\b/g,
  /[{}[\]();]/g,
  /=>/g,
];

export const EXPLANATION_PATTERNS = [
  /\b(because|since|due to|reason|allows|enables|helps)\b/i,
  /\b(for example|such as|like|including)\b/i,
  /\b(first|second|then|finally|additionally)\b/i,
];

export const SCORING_THRESHOLDS = {
  wordCount: {
    minimal: 10,
    short: 25,
    medium: 50,
    long: 100,
  },
  baseScores: {
    minimal: 0.2,
    short: 0.4,
    medium: 0.6,
    long: 0.75,
    extensive: 0.85,
  },
  bonuses: {
    technicalTermMax: 0.2,
    technicalTermMultiplier: 0.05,
    codeExample: 0.15,
    explanation: 0.1,
    complexityMax: 0.1,
  },
  difficultyMultipliers: {
    [QuestionDifficulty.EASY]: 0.9,
    [QuestionDifficulty.MEDIUM]: 0.85,
    [QuestionDifficulty.HARD]: 0.8,
  } as Record<QuestionDifficulty, number>,
  finalScore: {
    min: 0.15,
    max: 0.95,
  },
};

export const PERFORMANCE_THRESHOLDS = {
  exceptional: 85,
  strong: 75,
  solid: 65,
  adequate: 50,
};

export const CHAT_RESPONSES = {
  name: "Thank you! I've recorded your name.",
  email: "Great! Your email has been saved.",
  phone: "Perfect! Your phone number is recorded.",
  default: "Thank you for your response!",
};