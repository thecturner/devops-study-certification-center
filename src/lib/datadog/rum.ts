"use client";

import { datadogRum } from "@datadog/browser-rum";
import { PASS_THRESHOLD_PCT } from "@/lib/constants";

let initialized = false;

export function initDatadogRum(): void {
  if (initialized) return;

  const applicationId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID;
  const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;

  if (!applicationId || !clientToken) {
    // Credentials not configured; skip silently. App works without RUM.
    return;
  }

  datadogRum.init({
    applicationId,
    clientToken,
    site: "datadoghq.com",
    service: "devops-cert-study-center",
    env: process.env.NEXT_PUBLIC_DD_ENV ?? "development",
    version: "1.0.0",
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  });

  initialized = true;
}

export function trackQuizStarted(
  sessionId: string,
  config: { count: number; topics: string[]; difficulty: string; learningMode?: boolean }
): void {
  if (!initialized) return;
  datadogRum.addAction("quiz.started", {
    sessionId,
    questionCount: config.count,
    topicCount: config.topics.length,
    difficulty: config.difficulty,
    learningMode: config.learningMode ?? false,
  });
}

export function trackQuizSubmitted(sessionId: string, pct: number, totalQuestions: number): void {
  if (!initialized) return;
  datadogRum.addAction("quiz.submitted", {
    sessionId,
    score: pct,
    totalQuestions,
    passed: pct >= PASS_THRESHOLD_PCT,
  });
}
