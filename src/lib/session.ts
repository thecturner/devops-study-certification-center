"use client";

import { QuizSession } from "@/types/quiz";

const SESSION_KEY = "dd_quiz_session";

export function saveSession(session: QuizSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage unavailable (SSR context or storage quota)
  }
}

export function loadSession(): QuizSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("sessionId" in parsed)) {
      return null;
    }
    return parsed as QuizSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
