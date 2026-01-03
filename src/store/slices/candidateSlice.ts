// src/store/slices/candidateSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {  
  type CandidateInfo, 
  type ChatMessage, 
  type Question, 
  type InterviewState, 
  InterviewStatus
} from '../types';

const initialState: InterviewState = {
  currentCandidateId: null,
  candidates: {},
  isProcessing: false,
  error: null,
};

const candidateSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    createCandidate: (state, action: PayloadAction<{ id: string; info?: Partial<CandidateInfo> }>) => {
      const { id, info = {} } = action.payload;
      state.candidates[id] = {
        id,
        info,
        questions: [],
        chatHistory: [],
        status: InterviewStatus.NOT_STARTED,
        currentQuestionIndex: 0,
        totalScore: 0,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      state.currentCandidateId = id;
    },

    setCurrentCandidate: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
      if (state.candidates[action.payload]) {
        state.candidates[action.payload].lastActiveAt = Date.now();
      }
    },

    updateCandidateInfo: (state, action: PayloadAction<{ id: string; info: Partial<CandidateInfo> }>) => {
      const { id, info } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].info = { ...state.candidates[id].info, ...info };
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    setResumeData: (state, action: PayloadAction<{ id: string; fileName: string }>) => {
      const { id, fileName } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].resumeData = {
          fileName,
          uploadedAt: Date.now(),
        };
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    updateInterviewStatus: (state, action: PayloadAction<{ id: string; status: InterviewStatus }>) => {
      const { id, status } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].status = status;
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    addChatMessage: (state, action: PayloadAction<{ id: string; message: ChatMessage }>) => {
      const { id, message } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].chatHistory.push(message);
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    addQuestion: (state, action: PayloadAction<{ id: string; question: Question }>) => {
      const { id, question } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].questions.push(question);
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    updateQuestion: (state, action: PayloadAction<{ 
      id: string; 
      questionIndex: number; 
      updates: Partial<Question> 
    }>) => {
      const { id, questionIndex, updates } = action.payload;
      if (state.candidates[id] && state.candidates[id].questions[questionIndex]) {
        state.candidates[id].questions[questionIndex] = {
          ...state.candidates[id].questions[questionIndex],
          ...updates,
        };
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    setCurrentQuestionIndex: (state, action: PayloadAction<{ id: string; index: number }>) => {
      const { id, index } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].currentQuestionIndex = index;
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    updateTotalScore: (state, action: PayloadAction<{ id: string; score: number }>) => {
      const { id, score } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].totalScore = score;
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    setFinalSummary: (state, action: PayloadAction<{ id: string; summary: string }>) => {
      const { id, summary } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].finalSummary = summary;
        state.candidates[id].completedAt = Date.now();
        state.candidates[id].lastActiveAt = Date.now();
      }
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetCurrentCandidate: (state) => {
      state.currentCandidateId = null;
    },
  },
});

export const {
  createCandidate,
  setCurrentCandidate,
  updateCandidateInfo,
  setResumeData,
  updateInterviewStatus,
  addChatMessage,
  addQuestion,
  updateQuestion,
  setCurrentQuestionIndex,
  updateTotalScore,
  setFinalSummary,
  setProcessing,
  setError,
  clearError,
  resetCurrentCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;