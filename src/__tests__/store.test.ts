/**
 * Unit tests for the Zustand quiz store and session persistence logic.
 *
 * The Jest environment is "node", so sessionStorage is not available by default.
 * We install a mock before importing any modules that reference it.
 */

// ─── sessionStorage mock (must be installed before module imports) ────────────

const sessionStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem: (key: string) => sessionStore[key] ?? null,
  setItem: (key: string, value: string) => {
    sessionStore[key] = value;
  },
  removeItem: (key: string) => {
    delete sessionStore[key];
  },
  clear: () => {
    Object.keys(sessionStore).forEach((k) => delete sessionStore[k]);
  },
  length: 0,
  key: () => null,
};
Object.defineProperty(global, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import { useQuizStore } from "@/lib/store";
import type { ClientQuestion, QuizConfig, QuizResults } from "@/types/quiz";

// ─── Test fixtures ────────────────────────────────────────────────────────────

const SESSION_ID = "test-session-001";

const CONFIG: QuizConfig = {
  certificationId: "datadog-fundamentals",
  count: 3,
  topics: [],
  difficulty: "all",
  types: [],
  balanced: false,
  learningMode: false,
};

const QUESTIONS: ClientQuestion[] = [
  {
    id: "q1",
    type: "single_choice",
    prompt: "What is a Gauge?",
    choices: [
      { id: "a", text: "Instantaneous value" },
      { id: "b", text: "Cumulative count" },
    ],
    topics: ["metrics"],
    difficulty: "easy",
  },
  {
    id: "q2",
    type: "multi_choice",
    prompt: "Which are valid metric types?",
    choices: [
      { id: "a", text: "Gauge" },
      { id: "b", text: "Count" },
      { id: "c", text: "Flow" },
    ],
    topics: ["metrics"],
    difficulty: "medium",
  },
  {
    id: "q3",
    type: "true_false",
    prompt: "DogStatsD is enabled by default.",
    choices: [
      { id: "a", text: "True" },
      { id: "b", text: "False" },
    ],
    topics: ["metrics"],
    difficulty: "easy",
  },
];

const MOCK_RESULTS: QuizResults = {
  totalQuestions: 3,
  totalCorrect: 2,
  pct: 67,
  passed: false,
  byTopic: [
    { topicId: "metrics", label: "Metrics", attempted: 3, correct: 2, pct: 67 },
  ],
  byDifficulty: [
    { difficulty: "easy", attempted: 2, correct: 2, pct: 100 },
    { difficulty: "medium", attempted: 1, correct: 0, pct: 0 },
  ],
  questionResults: [],
  studyGuide: { weakTopics: [], nextSteps: [] },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Reset the Zustand store to initial state and clear sessionStorage between tests. */
function resetStore() {
  useQuizStore.setState(INITIAL_STATE);
  sessionStorageMock.clear();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetStore();
});

// ─── startQuiz ────────────────────────────────────────────────────────────────

describe("startQuiz", () => {
  it("sets sessionId, config, and questions", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);

    const state = useQuizStore.getState();
    expect(state.sessionId).toBe(SESSION_ID);
    expect(state.config).toEqual(CONFIG);
    expect(state.questions).toEqual(QUESTIONS);
  });

  it("resets currentIndex to 0", () => {
    // Advance the index first to simulate mid-quiz state
    useQuizStore.setState({ currentIndex: 2 });
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);

    expect(useQuizStore.getState().currentIndex).toBe(0);
  });

  it("clears answers from any prior state", () => {
    useQuizStore.setState({ answers: { q99: "a" } });
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);

    expect(useQuizStore.getState().answers).toEqual({});
  });

  it("clears results from any prior state", () => {
    useQuizStore.setState({ results: MOCK_RESULTS });
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);

    expect(useQuizStore.getState().results).toBeNull();
  });

  it("records a startedAt timestamp", () => {
    const before = Date.now();
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    const after = Date.now();

    const { startedAt } = useQuizStore.getState();
    expect(startedAt).not.toBeNull();
    expect(startedAt!).toBeGreaterThanOrEqual(before);
    expect(startedAt!).toBeLessThanOrEqual(after);
  });

  it("persists state to sessionStorage", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    expect(raw).not.toBeNull();

    const saved = JSON.parse(raw!);
    expect(saved.sessionId).toBe(SESSION_ID);
    expect(saved.questions).toHaveLength(QUESTIONS.length);
  });
});

// ─── setAnswer ────────────────────────────────────────────────────────────────

describe("setAnswer", () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
  });

  it("records a string answer for a single-choice question", () => {
    useQuizStore.getState().setAnswer("q1", "a");

    expect(useQuizStore.getState().answers["q1"]).toBe("a");
  });

  it("records a string[] answer for a multi-choice question", () => {
    useQuizStore.getState().setAnswer("q2", ["a", "b"]);

    expect(useQuizStore.getState().answers["q2"]).toEqual(["a", "b"]);
  });

  it("overwrites a previous answer for the same question", () => {
    useQuizStore.getState().setAnswer("q1", "a");
    useQuizStore.getState().setAnswer("q1", "b");

    expect(useQuizStore.getState().answers["q1"]).toBe("b");
  });

  it("does not overwrite answers for other questions", () => {
    useQuizStore.getState().setAnswer("q1", "a");
    useQuizStore.getState().setAnswer("q3", "b");

    expect(useQuizStore.getState().answers["q1"]).toBe("a");
    expect(useQuizStore.getState().answers["q3"]).toBe("b");
  });

  it("persists the updated answer to sessionStorage", () => {
    useQuizStore.getState().setAnswer("q1", "a");

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    const saved = JSON.parse(raw!);
    expect(saved.answers["q1"]).toBe("a");
  });
});

// ─── markQuestionChecked ──────────────────────────────────────────────────────

const MOCK_FEEDBACK = {
  questionId: "q1",
  correct: true,
  userAnswer: "a",
  correctAnswer: "a",
  explanation: "A is correct.",
  shortExplanation: "Correct.",
  longExplanation: "The correct answer is A.",
  preparationNote: "Review metrics.",
  studyPointers: [],
  topics: ["metrics"],
  difficulty: "easy" as const,
  prompt: "What is a Gauge?",
  choices: [
    { id: "a", text: "Instantaneous value" },
    { id: "b", text: "Cumulative count" },
  ],
};

describe("markQuestionChecked", () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
  });

  it("adds the question id to checkedQuestionIds", () => {
    useQuizStore.getState().markQuestionChecked("q1", MOCK_FEEDBACK);

    expect(useQuizStore.getState().checkedQuestionIds).toContain("q1");
  });

  it("stores the feedback result in learningFeedback", () => {
    useQuizStore.getState().markQuestionChecked("q1", MOCK_FEEDBACK);

    expect(useQuizStore.getState().learningFeedback["q1"]).toEqual(MOCK_FEEDBACK);
  });

  it("does not duplicate the id when called twice for the same question", () => {
    useQuizStore.getState().markQuestionChecked("q1", MOCK_FEEDBACK);
    useQuizStore.getState().markQuestionChecked("q1", MOCK_FEEDBACK);

    const ids = useQuizStore.getState().checkedQuestionIds.filter((id) => id === "q1");
    expect(ids).toHaveLength(1);
  });

  it("persists checked state to sessionStorage", () => {
    useQuizStore.getState().markQuestionChecked("q1", MOCK_FEEDBACK);

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    const saved = JSON.parse(raw!);
    expect(saved.checkedQuestionIds).toContain("q1");
  });
});

// ─── toggleFlag (flagQuestion / unflagQuestion) ───────────────────────────────

describe("toggleFlag", () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
  });

  it("adds a question id to the flagged array", () => {
    useQuizStore.getState().toggleFlag("q1");

    expect(useQuizStore.getState().flagged).toContain("q1");
  });

  it("is idempotent — calling again removes the flag (toggle behavior)", () => {
    useQuizStore.getState().toggleFlag("q1");
    useQuizStore.getState().toggleFlag("q1");

    expect(useQuizStore.getState().flagged).not.toContain("q1");
  });

  it("does not create duplicates after a single toggle", () => {
    useQuizStore.getState().toggleFlag("q1");

    const { flagged } = useQuizStore.getState();
    expect(flagged.filter((id) => id === "q1")).toHaveLength(1);
  });

  it("removes a flagged question when toggled a second time", () => {
    useQuizStore.getState().toggleFlag("q2");
    useQuizStore.getState().toggleFlag("q2");

    expect(useQuizStore.getState().flagged).not.toContain("q2");
  });

  it("can flag multiple different questions independently", () => {
    useQuizStore.getState().toggleFlag("q1");
    useQuizStore.getState().toggleFlag("q3");

    expect(useQuizStore.getState().flagged).toContain("q1");
    expect(useQuizStore.getState().flagged).toContain("q3");
  });

  it("persists flagged state to sessionStorage", () => {
    useQuizStore.getState().toggleFlag("q1");

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    const saved = JSON.parse(raw!);
    expect(saved.flagged).toContain("q1");
  });
});

// ─── setCurrentIndex ─────────────────────────────────────────────────────────

describe("setCurrentIndex", () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
  });

  it("advances the current question index", () => {
    useQuizStore.getState().setCurrentIndex(2);

    expect(useQuizStore.getState().currentIndex).toBe(2);
  });

  it("persists the index to sessionStorage", () => {
    useQuizStore.getState().setCurrentIndex(1);

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    const saved = JSON.parse(raw!);
    expect(saved.currentIndex).toBe(1);
  });
});

// ─── submitQuiz ───────────────────────────────────────────────────────────────

describe("submitQuiz", () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
  });

  it("stores results in state", () => {
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    expect(useQuizStore.getState().results).toEqual(MOCK_RESULTS);
  });

  it("records a submittedAt timestamp", () => {
    const before = Date.now();
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);
    const after = Date.now();

    const { submittedAt } = useQuizStore.getState();
    expect(submittedAt).not.toBeNull();
    expect(submittedAt!).toBeGreaterThanOrEqual(before);
    expect(submittedAt!).toBeLessThanOrEqual(after);
  });

  it("retains questions after submit", () => {
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    expect(useQuizStore.getState().questions).toEqual(QUESTIONS);
  });

  it("retains config after submit", () => {
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    expect(useQuizStore.getState().config).toEqual(CONFIG);
  });

  it("persists results to sessionStorage", () => {
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    const raw = sessionStorageMock.getItem("dd_quiz_session");
    const saved = JSON.parse(raw!);
    expect(saved.results).toMatchObject({ totalQuestions: 3, pct: 67 });
  });
});

// ─── resetQuiz ────────────────────────────────────────────────────────────────

describe("resetQuiz", () => {
  it("clears all state back to initial", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    useQuizStore.getState().setAnswer("q1", "a");
    useQuizStore.getState().toggleFlag("q2");
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    useQuizStore.getState().resetQuiz();

    const state = useQuizStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.config).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual({});
    expect(state.flagged).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.results).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.submittedAt).toBeNull();
  });

  it("clears sessionStorage", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    expect(sessionStorageMock.getItem("dd_quiz_session")).not.toBeNull();

    useQuizStore.getState().resetQuiz();

    expect(sessionStorageMock.getItem("dd_quiz_session")).toBeNull();
  });
});

// ─── abandonQuiz ─────────────────────────────────────────────────────────────

describe("abandonQuiz", () => {
  it("clears all state back to initial", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    useQuizStore.getState().setAnswer("q1", "a");

    useQuizStore.getState().abandonQuiz();

    const state = useQuizStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.config).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual({});
    expect(state.flagged).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.results).toBeNull();
    expect(state.startedAt).toBeNull();
  });

  it("clears sessionStorage", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    expect(sessionStorageMock.getItem("dd_quiz_session")).not.toBeNull();

    useQuizStore.getState().abandonQuiz();

    expect(sessionStorageMock.getItem("dd_quiz_session")).toBeNull();
  });
});

// ─── hydrateFromSession ───────────────────────────────────────────────────────

describe("hydrateFromSession", () => {
  it("restores state after startQuiz has written to sessionStorage", () => {
    // Write state to sessionStorage via startQuiz
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    useQuizStore.getState().setAnswer("q1", "a");
    useQuizStore.getState().toggleFlag("q2");
    useQuizStore.getState().setCurrentIndex(1);

    // Reset the in-memory store (simulates a fresh page load)
    useQuizStore.setState(INITIAL_STATE);
    expect(useQuizStore.getState().sessionId).toBeNull();

    // Hydrate from the persisted sessionStorage entry
    useQuizStore.getState().hydrateFromSession();

    const state = useQuizStore.getState();
    expect(state.sessionId).toBe(SESSION_ID);
    expect(state.config).toEqual(CONFIG);
    expect(state.questions).toEqual(QUESTIONS);
    expect(state.answers["q1"]).toBe("a");
    expect(state.flagged).toContain("q2");
    expect(state.currentIndex).toBe(1);
  });

  it("restores submitted results from sessionStorage", () => {
    useQuizStore.getState().startQuiz(SESSION_ID, CONFIG, QUESTIONS);
    useQuizStore.getState().submitQuiz(MOCK_RESULTS);

    useQuizStore.setState(INITIAL_STATE);
    useQuizStore.getState().hydrateFromSession();

    expect(useQuizStore.getState().results).toMatchObject({ pct: 67, passed: false });
  });

  it("leaves state at initial values when sessionStorage is empty", () => {
    // sessionStorage is already clear (cleared in beforeEach)
    useQuizStore.getState().hydrateFromSession();

    const state = useQuizStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual({});
  });

  it("leaves state at initial values when sessionStorage key is missing", () => {
    sessionStorageMock.setItem("some_other_key", JSON.stringify({ irrelevant: true }));

    useQuizStore.getState().hydrateFromSession();

    expect(useQuizStore.getState().sessionId).toBeNull();
  });

  it("leaves state unchanged when sessionStorage contains invalid JSON", () => {
    sessionStorageMock.setItem("dd_quiz_session", "not valid json{{{");

    useQuizStore.getState().hydrateFromSession();

    expect(useQuizStore.getState().sessionId).toBeNull();
  });

  it("defaults checkedQuestionIds and learningFeedback when absent from stored session", () => {
    // Simulate a session saved by an older version that lacks these fields
    const legacySession = {
      sessionId: SESSION_ID,
      config: CONFIG,
      questions: QUESTIONS,
      answers: {},
      flagged: [],
      currentIndex: 0,
      startedAt: Date.now(),
      submittedAt: null,
      results: null,
      // checkedQuestionIds and learningFeedback deliberately omitted
    };
    sessionStorageMock.setItem("dd_quiz_session", JSON.stringify(legacySession));

    useQuizStore.getState().hydrateFromSession();

    const state = useQuizStore.getState();
    expect(state.checkedQuestionIds).toEqual([]);
    expect(state.learningFeedback).toEqual({});
  });
});
