import { gradeQuestion, buildQuestionResult } from "@/lib/grading/question-feedback";
import type { Question } from "@/types/quiz";

jest.mock("@/data/taxonomy.json", () => ({
  topics: [
    {
      id: "metrics",
      label: "Metrics",
      description: "Metrics fundamentals.",
      studyPointers: [
        { label: "Metrics docs", url: "https://docs.datadoghq.com/metrics/" },
      ],
      examScenarios: [],
    },
  ],
}));

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeSingle(correct: string, choices = [
  { id: "a", text: "Alpha" },
  { id: "b", text: "Beta" },
  { id: "c", text: "Gamma" },
]): Question {
  return {
    id: "q-single",
    type: "single_choice",
    prompt: "Pick one.",
    choices,
    correct,
    explanation: "Explanation.",
    topics: ["metrics"],
    difficulty: "easy",
    version: 1,
  };
}

function makeMulti(correct: string[]): Question {
  return {
    id: "q-multi",
    type: "multi_choice",
    prompt: "Pick all.",
    choices: [
      { id: "a", text: "Alpha" },
      { id: "b", text: "Beta" },
      { id: "c", text: "Gamma" },
    ],
    correct,
    explanation: "Explanation.",
    topics: ["metrics"],
    difficulty: "medium",
    version: 1,
  };
}

// ─── gradeQuestion ────────────────────────────────────────────────────────────

describe("gradeQuestion", () => {
  it("returns false for null answer", () => {
    expect(gradeQuestion(makeSingle("a"), null)).toBe(false);
  });

  it("returns false for undefined answer", () => {
    expect(gradeQuestion(makeSingle("a"), undefined)).toBe(false);
  });

  it("returns true for correct single_choice string", () => {
    expect(gradeQuestion(makeSingle("a"), "a")).toBe(true);
  });

  it("returns false for wrong single_choice string", () => {
    expect(gradeQuestion(makeSingle("a"), "b")).toBe(false);
  });

  it("returns false when single_choice answer is an array", () => {
    expect(gradeQuestion(makeSingle("a"), ["a"])).toBe(false);
  });

  it("returns true for correct multi_choice (exact set)", () => {
    expect(gradeQuestion(makeMulti(["a", "b"]), ["a", "b"])).toBe(true);
  });

  it("returns false for multi_choice with wrong length", () => {
    expect(gradeQuestion(makeMulti(["a", "b"]), ["a"])).toBe(false);
  });

  it("returns false for multi_choice when userAnswer is a string, not array", () => {
    expect(gradeQuestion(makeMulti(["a", "b"]), "a")).toBe(false);
  });

  it("returns false for an unknown question type", () => {
    const q = { ...makeSingle("a"), type: "essay" as never };
    expect(gradeQuestion(q, "a")).toBe(false);
  });
});

// ─── buildQuestionResult: shortExplanation branches ──────────────────────────

describe("buildQuestionResult shortExplanation", () => {
  it("starts with 'Correct.' when answer is right", () => {
    const result = buildQuestionResult(makeSingle("a"), "a");
    expect(result.correct).toBe(true);
    expect(result.shortExplanation).toMatch(/^Correct\./);
  });

  it("describes a null answer as 'no answer was submitted'", () => {
    const result = buildQuestionResult(makeSingle("a"), null);
    expect(result.correct).toBe(false);
    expect(result.shortExplanation).toContain("no answer was submitted");
  });

  it("describes an empty-array answer as 'no answer was submitted'", () => {
    const result = buildQuestionResult(makeMulti(["a", "b"]), []);
    expect(result.correct).toBe(false);
    expect(result.shortExplanation).toContain("no answer was submitted");
  });

  it("lists missing choices in multi-choice explanation", () => {
    // selected ["a"], correct ["a","b"] — missing "b", no extra
    const result = buildQuestionResult(makeMulti(["a", "b"]), ["a"]);
    expect(result.shortExplanation).toContain("missed");
    expect(result.shortExplanation).not.toContain("included");
  });

  it("lists extra choices in multi-choice explanation", () => {
    // selected ["a","b","c"], correct ["a","b"] — extra "c", no missing
    const result = buildQuestionResult(makeMulti(["a", "b"]), ["a", "b", "c"]);
    expect(result.shortExplanation).toContain("included");
    expect(result.shortExplanation).not.toContain("missed");
  });

  it("lists both missing and extra in multi-choice explanation", () => {
    // selected ["a","c"], correct ["a","b"] — missing "b", extra "c"
    const result = buildQuestionResult(makeMulti(["a", "b"]), ["a", "c"]);
    expect(result.shortExplanation).toContain("missed");
    expect(result.shortExplanation).toContain("included");
  });

  it("falls back to simple wrong explanation for non-multi-choice incorrect answer", () => {
    const result = buildQuestionResult(makeSingle("a"), "b");
    expect(result.shortExplanation).toContain("instead of");
  });

  it("wraps a string userAnswer into an array when grading multi_choice", () => {
    // userAnswer is a string, not an array; exercises the [userAnswer] branch
    const result = buildQuestionResult(makeMulti(["a", "b"]), "a");
    expect(result.correct).toBe(false);
    expect(result.shortExplanation).toContain("missed");
  });

  it("uses the choiceId as text when the choice id is not found in choices", () => {
    // answer "z" is not among choices, so getChoiceText returns "z" as-is
    const result = buildQuestionResult(makeSingle("a"), "z");
    expect(result.shortExplanation).toContain('"z"');
  });
});

// ─── buildQuestionResult: studyPointers / refs ────────────────────────────────

describe("buildQuestionResult studyPointers", () => {
  it("includes topic study pointers from taxonomy", () => {
    const result = buildQuestionResult(makeSingle("a"), "a");
    expect(result.studyPointers.some((p) => p.label === "Metrics docs")).toBe(true);
  });

  it("includes refs from the question when present", () => {
    const q: Question = {
      ...makeSingle("a"),
      refs: [{ label: "Custom ref", url: "https://example.com/ref" }],
    };
    const result = buildQuestionResult(q, "a");
    expect(result.studyPointers.some((p) => p.label === "Custom ref")).toBe(true);
  });

  it("deduplicates study pointers when topic and refs share an entry", () => {
    const q: Question = {
      ...makeSingle("a"),
      refs: [{ label: "Metrics docs", url: "https://docs.datadoghq.com/metrics/" }],
    };
    const result = buildQuestionResult(q, "a");
    const count = result.studyPointers.filter((p) => p.label === "Metrics docs").length;
    expect(count).toBe(1);
  });

  it("handles topics not in the taxonomy (empty pointers)", () => {
    const q: Question = {
      ...makeSingle("a"),
      topics: ["unknown-topic-xyz"],
    };
    const result = buildQuestionResult(q, "a");
    expect(result.studyPointers).toHaveLength(0);
  });

  it("includes refs without a url", () => {
    const q: Question = {
      ...makeSingle("a"),
      refs: [{ label: "Internal note" }],
    };
    const result = buildQuestionResult(q, "a");
    expect(result.studyPointers.some((p) => p.label === "Internal note")).toBe(true);
  });
});

// ─── buildQuestionResult: preparationNote ─────────────────────────────────────

describe("buildQuestionResult preparationNote", () => {
  it("includes topic description when topic is in the taxonomy", () => {
    const result = buildQuestionResult(makeSingle("a"), "a");
    expect(result.preparationNote).toContain("Metrics");
  });

  it("falls back to generic note when no topics are in the taxonomy", () => {
    const q: Question = { ...makeSingle("a"), topics: ["unknown-xyz"] };
    const result = buildQuestionResult(q, "a");
    expect(result.preparationNote).toContain("review the underlying concept");
  });
});
