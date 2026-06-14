import React from "react";
import { render } from "@testing-library/react";
import type { ClientQuestion, QuizConfig } from "@/types/quiz";

// Mock next/navigation before importing QuizRunner
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock the Zustand store
jest.mock("@/lib/store", () => ({
  useQuizStore: jest.fn(),
}));

// Mock sub-components to avoid deep rendering trees
jest.mock("@/components/quiz/QuestionCard", () => ({
  QuestionCard: () => <div data-testid="question-card" />,
}));

jest.mock("@/components/quiz/QuestionNav", () => ({
  QuestionNav: () => <div data-testid="question-nav" />,
}));

jest.mock("@/components/quiz/ProgressBar", () => ({
  ProgressBar: () => <div data-testid="progress-bar" />,
}));

jest.mock("@/components/quiz/LearningFeedbackPanel", () => ({
  LearningFeedbackPanel: () => <div data-testid="learning-feedback" />,
}));

jest.mock("@/components/BrandLockup", () => ({
  BrandLockup: () => <div data-testid="brand-lockup" />,
}));

jest.mock("@/lib/datadog/rum", () => ({
  trackQuizSubmitted: jest.fn(),
}));

jest.mock("@/hooks/useHydrateSession", () => ({
  useHydrateSession: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock shadcn/ui dialog — render children inline so the component tree is visible
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

import { useQuizStore } from "@/lib/store";
import { QuizRunner } from "@/components/quiz/QuizRunner";

const mockUseQuizStore = useQuizStore as jest.MockedFunction<typeof useQuizStore>;

const MOCK_QUESTION: ClientQuestion = {
  id: "q1",
  type: "single_choice",
  prompt: "Test question?",
  choices: [
    { id: "a", text: "Option A" },
    { id: "b", text: "Option B" },
  ],
  topics: ["metrics"],
  difficulty: "easy",
};

function buildStoreState(overrides: {
  certificationId?: string;
  hasSession?: boolean;
}): ReturnType<typeof useQuizStore> {
  const { certificationId, hasSession = true } = overrides;

  const config: QuizConfig | null = certificationId
    ? {
        certificationId: certificationId as QuizConfig["certificationId"],
        count: 1,
        topics: [],
        difficulty: "all",
        types: [],
        balanced: false,
        learningMode: false,
      }
    : null;

  return {
    sessionId: hasSession ? "test-session-id" : null,
    config,
    questions: [MOCK_QUESTION],
    answers: {},
    checkedQuestionIds: [],
    learningFeedback: {},
    flagged: [],
    currentIndex: 0,
    startedAt: Date.now(),
    submittedAt: null,
    results: null,
    startQuiz: jest.fn(),
    setAnswer: jest.fn(),
    markQuestionChecked: jest.fn(),
    toggleFlag: jest.fn(),
    setCurrentIndex: jest.fn(),
    submitQuiz: jest.fn(),
    abandonQuiz: jest.fn(),
    resetQuiz: jest.fn(),
    hydrateFromSession: jest.fn(),
  };
}

describe("QuizRunner vendor CSS class", () => {
  it("adds vendor-servicenow class when certificationId is servicenow-csa", () => {
    mockUseQuizStore.mockReturnValue(
      buildStoreState({ certificationId: "servicenow-csa" })
    );
    const { container } = render(<QuizRunner />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass("vendor-servicenow");
  });

  it("does not add vendor-servicenow class when certificationId is datadog-fundamentals", () => {
    mockUseQuizStore.mockReturnValue(
      buildStoreState({ certificationId: "datadog-fundamentals" })
    );
    const { container } = render(<QuizRunner />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).not.toHaveClass("vendor-servicenow");
  });

  it("does not add vendor-servicenow class when config is null", () => {
    mockUseQuizStore.mockReturnValue(
      buildStoreState({ certificationId: undefined })
    );
    const { container } = render(<QuizRunner />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).not.toHaveClass("vendor-servicenow");
  });
});
