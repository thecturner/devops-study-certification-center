import React from "react";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "@/components/results/ScoreCard";
import type { QuizResults } from "@/types/quiz";

function makeResults(overrides: Partial<QuizResults> = {}): QuizResults {
  return {
    pct: 80,
    passed: true,
    totalCorrect: 8,
    totalQuestions: 10,
    questionResults: [],
    byTopic: [],
    byDifficulty: [
      { difficulty: "easy", correct: 4, attempted: 5, pct: 80 },
      { difficulty: "medium", correct: 3, attempted: 4, pct: 75 },
      { difficulty: "hard", correct: 1, attempted: 1, pct: 100 },
    ],
    studyGuide: { weakTopics: [], nextSteps: [] },
    ...overrides,
  };
}

describe("ScoreCard", () => {
  describe("when passed", () => {
    it("shows the Passed badge", () => {
      render(<ScoreCard results={makeResults({ passed: true })} />);
      expect(screen.getByText("Passed")).toBeInTheDocument();
    });

    it("does not show the Needs Work badge", () => {
      render(<ScoreCard results={makeResults({ passed: true })} />);
      expect(screen.queryByText("Needs Work")).not.toBeInTheDocument();
    });
  });

  describe("when failed", () => {
    it("shows the Needs Work badge", () => {
      render(<ScoreCard results={makeResults({ passed: false, pct: 60 })} />);
      expect(screen.getByText("Needs Work")).toBeInTheDocument();
    });

    it("does not show the Passed badge", () => {
      render(<ScoreCard results={makeResults({ passed: false, pct: 60 })} />);
      expect(screen.queryByText("Passed")).not.toBeInTheDocument();
    });
  });

  it("displays the score percentage", () => {
    render(<ScoreCard results={makeResults({ pct: 72 })} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("displays correct out of total", () => {
    render(<ScoreCard results={makeResults({ totalCorrect: 7, totalQuestions: 10 })} />);
    expect(screen.getByText(/7 correct out of 10/)).toBeInTheDocument();
  });

  it("shows the pass threshold", () => {
    render(<ScoreCard results={makeResults()} />);
    expect(screen.getByText(/Pass threshold: 70%/)).toBeInTheDocument();
  });

  it("renders a stat cell for each difficulty", () => {
    render(<ScoreCard results={makeResults()} />);
    expect(screen.getByText("easy")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("hard")).toBeInTheDocument();
  });

  it("shows a dash when no questions were attempted for a difficulty", () => {
    render(
      <ScoreCard
        results={makeResults({
          byDifficulty: [
            { difficulty: "easy", correct: 0, attempted: 0, pct: 0 },
            { difficulty: "medium", correct: 0, attempted: 0, pct: 0 },
            { difficulty: "hard", correct: 0, attempted: 0, pct: 0 },
          ],
        })}
      />
    );
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(3);
  });
});
