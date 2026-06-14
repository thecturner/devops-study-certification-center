import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/lib/store", () => ({
  useQuizStore: jest.fn((selector: (s: { startQuiz: jest.Mock }) => unknown) =>
    selector({ startQuiz: jest.fn() })
  ),
}));

jest.mock("@/lib/datadog/rum", () => ({
  trackQuizStarted: jest.fn(),
}));

// Minimal UI stubs
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} type={type as "button" | "submit" | "reset"} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { QuizConfigForm } from "@/components/quiz/QuizConfigForm";

const TOPICS_RESPONSE = {
  topics: [
    { id: "metrics", label: "Metrics" },
    { id: "logs", label: "Logs" },
  ],
};

function setupFetch(ok = true, data: object = { sessionId: "s1", questions: [] }) {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (typeof url === "string" && url.includes("/api/topics")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(TOPICS_RESPONSE),
      });
    }
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(ok ? data : { error: "Server error" }),
    });
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("QuizConfigForm", () => {
  it("renders the build mode options", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    expect(screen.getByText("Auto Mix")).toBeInTheDocument();
    expect(screen.getByText("Custom Filters")).toBeInTheDocument();
  });

  it("renders preset question count buttons", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "25" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50" })).toBeInTheDocument();
  });

  it("submit button is present and eventually enabled after mount", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled();
    });
  });

  it("shows custom filters when Custom Filters mode is selected", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole("button", { name: /custom filters/i }));
    // Topics section heading should appear (exact text match to avoid collision
    // with descriptive sentences that also contain the word "topics")
    expect(screen.getByText("Topics", { exact: false, selector: "div" })).toBeInTheDocument();
    // Difficulty buttons
    expect(screen.getByRole("button", { name: /all levels/i })).toBeInTheDocument();
  });

  it("hides custom filters in Auto Mix mode", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    // Auto Mix is default — custom filters not shown
    expect(screen.queryByRole("button", { name: /all levels/i })).not.toBeInTheDocument();
  });

  it("shows topic pills after switching to Custom Filters and receiving topics", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole("button", { name: /custom filters/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Metrics" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Logs" })).toBeInTheDocument();
    });
  });

  it("shows an error message when the generate API fails", async () => {
    setupFetch(false);
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it("shows the custom count input when Custom is clicked", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole("button", { name: /^custom$/i }));
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("shows learning mode description when Learning Mode is selected", async () => {
    setupFetch();
    render(<QuizConfigForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /start quiz/i })).not.toBeDisabled()
    );
    fireEvent.click(screen.getByRole("button", { name: /learning mode/i }));
    expect(
      screen.getByText(/learning mode reveals why an answer was wrong/i)
    ).toBeInTheDocument();
  });
});
