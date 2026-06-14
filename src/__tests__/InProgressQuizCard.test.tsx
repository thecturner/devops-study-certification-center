import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/lib/store", () => ({
  useQuizStore: jest.fn(),
}));

jest.mock("@/hooks/useHydrateSession", () => ({
  useHydrateSession: jest.fn(),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import { useQuizStore } from "@/lib/store";
import { InProgressQuizCard } from "@/components/quiz/InProgressQuizCard";
import type { ClientQuestion } from "@/types/quiz";

const mockUseQuizStore = useQuizStore as jest.MockedFunction<typeof useQuizStore>;

const MOCK_QUESTION: ClientQuestion = {
  id: "q1",
  type: "single_choice",
  prompt: "Test?",
  choices: [{ id: "a", text: "A" }],
  topics: ["metrics"],
  difficulty: "easy",
};

function buildState(overrides: {
  sessionId?: string | null;
  questions?: ClientQuestion[];
  results?: object | null;
  answers?: Record<string, unknown>;
  currentIndex?: number;
  abandonQuiz?: jest.Mock;
}) {
  const abandonQuiz = overrides.abandonQuiz ?? jest.fn();
  return {
    // Use explicit `in` check so that passing `null` is preserved as null
    // rather than falling through the ?? default ("sess-1")
    sessionId: "sessionId" in overrides ? overrides.sessionId : "sess-1",
    questions: overrides.questions ?? [MOCK_QUESTION],
    answers: overrides.answers ?? {},
    currentIndex: overrides.currentIndex ?? 0,
    results: "results" in overrides ? overrides.results : null,
    abandonQuiz,
    config: null,
    checkedQuestionIds: [],
    learningFeedback: {},
    flagged: [],
    startedAt: Date.now(),
    submittedAt: null,
    startQuiz: jest.fn(),
    setAnswer: jest.fn(),
    markQuestionChecked: jest.fn(),
    toggleFlag: jest.fn(),
    setCurrentIndex: jest.fn(),
    submitQuiz: jest.fn(),
    resetQuiz: jest.fn(),
    hydrateFromSession: jest.fn(),
  } as ReturnType<typeof useQuizStore>;
}

describe("InProgressQuizCard", () => {
  it("renders nothing when there is no sessionId", () => {
    mockUseQuizStore.mockReturnValue(buildState({ sessionId: null }));
    const { container } = render(<InProgressQuizCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there are no questions", () => {
    mockUseQuizStore.mockReturnValue(buildState({ questions: [] }));
    const { container } = render(<InProgressQuizCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when results already exist (quiz finished)", () => {
    mockUseQuizStore.mockReturnValue(buildState({ results: { pct: 80 } }));
    const { container } = render(<InProgressQuizCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the in-progress card when session is active", () => {
    mockUseQuizStore.mockReturnValue(buildState({}));
    render(<InProgressQuizCard />);
    expect(screen.getByText("You have an in-progress test.")).toBeInTheDocument();
  });

  it("shows the resume link pointing to /quiz", () => {
    mockUseQuizStore.mockReturnValue(buildState({}));
    render(<InProgressQuizCard />);
    expect(screen.getByRole("link", { name: /resume test/i })).toHaveAttribute("href", "/quiz");
  });

  it("shows question count and answered count", () => {
    mockUseQuizStore.mockReturnValue(
      buildState({ questions: [MOCK_QUESTION], answers: { q1: "a" }, currentIndex: 0 })
    );
    render(<InProgressQuizCard />);
    expect(screen.getByText(/question 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(/1 answered/i)).toBeInTheDocument();
  });

  describe("abandon flow", () => {
    it("opens the abandon dialog when Abandon Test is clicked", () => {
      mockUseQuizStore.mockReturnValue(buildState({}));
      render(<InProgressQuizCard />);
      fireEvent.click(screen.getByRole("button", { name: /abandon test/i }));
      expect(screen.getByText(/abandon this in-progress test/i)).toBeInTheDocument();
    });

    it("closes the dialog when Keep Test is clicked", () => {
      mockUseQuizStore.mockReturnValue(buildState({}));
      render(<InProgressQuizCard />);
      fireEvent.click(screen.getByRole("button", { name: /abandon test/i }));
      fireEvent.click(screen.getByRole("button", { name: /keep test/i }));
      expect(screen.queryByText(/abandon this in-progress test/i)).not.toBeInTheDocument();
    });

    it("calls abandonQuiz when confirmed", () => {
      const abandonQuiz = jest.fn();
      mockUseQuizStore.mockReturnValue(buildState({ abandonQuiz }));
      render(<InProgressQuizCard />);
      fireEvent.click(screen.getByRole("button", { name: /abandon test/i }));
      // The confirm button inside the dialog
      const confirmButtons = screen.getAllByRole("button", { name: /abandon test/i });
      // The second one is inside the dialog
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);
      expect(abandonQuiz).toHaveBeenCalledTimes(1);
    });
  });
});
