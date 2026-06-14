import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/quiz/ProgressBar";

// Stub out the shadcn Progress so it renders a predictable element
jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value} />
  ),
}));

describe("ProgressBar", () => {
  it("shows 0% when value is 0", () => {
    render(<ProgressBar value={0} max={10} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows 50% when value is half of max", () => {
    render(<ProgressBar value={5} max={10} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows 100% when fully answered", () => {
    render(<ProgressBar value={10} max={10} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows 0% and does not divide by zero when max is 0", () => {
    render(<ProgressBar value={0} max={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("rounds to nearest integer", () => {
    render(<ProgressBar value={1} max={3} />);
    // 1/3 = 0.333 → 33%
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("passes computed percentage to the underlying Progress component", () => {
    render(<ProgressBar value={3} max={4} />);
    // 3/4 = 75%
    expect(screen.getByTestId("progress")).toHaveAttribute("data-value", "75");
  });
});
