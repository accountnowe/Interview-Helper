// src/utils/helpers.ts

import { QuestionDifficulty } from '../store/types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getTimeLimitForDifficulty = (difficulty: QuestionDifficulty): number => {
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return 60;
    case QuestionDifficulty.MEDIUM:
      return 120;
    case QuestionDifficulty.HARD:
      return 160;
    default:
      return 60;
  }
};

export const getQuestionSequence = (): QuestionDifficulty[] => {
  return [
    QuestionDifficulty.EASY,
    QuestionDifficulty.EASY,
    QuestionDifficulty.MEDIUM,
    QuestionDifficulty.MEDIUM,
    QuestionDifficulty.HARD,
    QuestionDifficulty.HARD,
  ];
};

export const calculatePercentage = (score: number, total: number): number => {
  return total > 0 ? Math.round((score / total) * 100) : 0;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBadgeVariant = (percentage: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (percentage >= 80) return 'default';
  if (percentage >= 60) return 'secondary';
  if (percentage >= 40) return 'outline';
  return 'destructive';
};