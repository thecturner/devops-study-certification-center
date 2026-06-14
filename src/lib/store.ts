"use client";

import { create } from "zustand";
import { ClientQuestion, QuizConfig, AnswerMap, QuizResults, QuestionResult } from "@/types/quiz";
import { saveSession, loadSession, clearSession } from "./session";

interface QuizState {
  // Session
  sessionId: string | null;
  config: QuizConfig | null;
  questions: ClientQuestion[];
  answers: AnswerMap;
  checkedQuestionIds: string[];
  learningFeedback: Record<string, QuestionResult>;
  flagged: string[];
  currentIndex: number;
  startedAt: number | null;
  submittedAt: number | null;
  results: QuizResults | null;

  // Actions
  startQuiz: (sessionId: string, config: QuizConfig, questions: ClientQuestion[]) => void;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  markQuestionChecked: (questionId: string, feedback: QuestionResult) => void;
  toggleFlag: (questionId: string) => void;
  setCurrentIndex: (index: number) => void;
  submitQuiz: (results: QuizResults) => void;
  abandonQuiz: () => void;
  resetQuiz: () => void;
  hydrateFromSession: () => void;
}

const INITIAL_STATE = {
  sessionId: null,
  config: null,
  questions: [],
  answers: {},
  checkedQuestionIds: [],
  learningFeedback: {},
  flagged: [],
  currentIndex: 0,
  startedAt: null,
  submittedAt: null,
  results: null,
};

export const useQuizStore = create<QuizState>((set) => ({
  ...INITIAL_STATE,

  startQuiz: (sessionId, config, questions) => {
    const state = {
      ...INITIAL_STATE,
      sessionId,
      config,
      questions,
      startedAt: Date.now(),
    };
    set(state);
    saveSession({ ...state, results: null });
  },

  setAnswer: (questionId, answer) => {
    set((s) => {
      const answers = { ...s.answers, [questionId]: answer };
      const next = { ...s, answers };
      saveSession({ ...next, results: null });
      return { answers };
    });
  },

  markQuestionChecked: (questionId, feedback) => {
    set((s) => {
      const checkedQuestionIds = s.checkedQuestionIds.includes(questionId)
        ? s.checkedQuestionIds
        : [...s.checkedQuestionIds, questionId];
      const learningFeedback = { ...s.learningFeedback, [questionId]: feedback };
      const next = { ...s, checkedQuestionIds, learningFeedback };
      saveSession({ ...next, results: null });
      return { checkedQuestionIds, learningFeedback };
    });
  },

  toggleFlag: (questionId) => {
    set((s) => {
      const flagged = s.flagged.includes(questionId)
        ? s.flagged.filter((id) => id !== questionId)
        : [...s.flagged, questionId];
      const next = { ...s, flagged };
      saveSession({ ...next, results: null });
      return { flagged };
    });
  },

  setCurrentIndex: (index) => {
    set((s) => {
      const next = { ...s, currentIndex: index };
      saveSession({ ...next, results: null });
      return { currentIndex: index };
    });
  },

  submitQuiz: (results) => {
    const submittedAt = Date.now();
    set((s) => {
      const next = { ...s, submittedAt, results };
      saveSession(next);
      return { submittedAt, results };
    });
  },

  abandonQuiz: () => {
    clearSession();
    set(INITIAL_STATE);
  },

  resetQuiz: () => {
    clearSession();
    set(INITIAL_STATE);
  },

  hydrateFromSession: () => {
    const session = loadSession();
    if (session) {
      set({
        sessionId: session.sessionId,
        config: session.config,
        questions: session.questions,
        answers: session.answers,
        checkedQuestionIds: session.checkedQuestionIds ?? [],
        learningFeedback: session.learningFeedback ?? {},
        flagged: session.flagged,
        currentIndex: session.currentIndex,
        startedAt: session.startedAt,
        submittedAt: session.submittedAt ?? null,
        results: session.results ?? null,
      });
    }
  },
}));
