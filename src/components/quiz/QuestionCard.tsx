"use client";

import { useQuizStore } from "@/lib/store";
import { ClientQuestion } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props {
  question: ClientQuestion;
  questionNumber: number;
  totalQuestions: number;
  isFlagged: boolean;
  disabled?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  isFlagged,
  disabled = false,
}: Props) {
  const { answers, setAnswer, toggleFlag } = useQuizStore();
  const currentAnswer = answers[question.id];

  const isMulti = question.type === "multi_choice";

  function handleSingleSelect(choiceId: string) {
    if (disabled) return;
    setAnswer(question.id, choiceId);
  }

  function handleMultiToggle(choiceId: string) {
    if (disabled) return;
    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
    const next = current.includes(choiceId)
      ? current.filter((c) => c !== choiceId)
      : [...current, choiceId];
    setAnswer(question.id, next);
  }

  function isSelected(choiceId: string): boolean {
    if (isMulti) {
      return Array.isArray(currentAnswer) && currentAnswer.includes(choiceId);
    }
    return currentAnswer === choiceId;
  }

  return (
    <Card className="brand-panel overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {questionNumber} / {totalQuestions}
            </span>
            <Badge variant="outline" className={cn("text-xs capitalize", DIFFICULTY_COLORS[question.difficulty])}>
              {question.difficulty}
            </Badge>
            {isMulti && (
              <Badge variant="secondary" className="text-xs">
                Select all that apply
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => toggleFlag(question.id)}
            aria-label={isFlagged ? "Remove flag" : "Flag for review"}
            className={cn(
              "rounded p-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
              isFlagged ? "text-amber-500" : "text-gray-300 hover:text-amber-400"
            )}
          >
            {isFlagged ? "⚑ Flagged" : "⚐ Flag"}
          </button>
        </div>
        <p className="mt-2 text-base font-medium leading-relaxed text-gray-900 dark:text-white">
          {question.prompt}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-2" role={isMulti ? "group" : "radiogroup"} aria-label="Answer choices">
          {question.choices.map((choice) => {
            const selected = isSelected(choice.id);
            return (
              <button
                key={choice.id}
                type="button"
                role={isMulti ? "checkbox" : "radio"}
                aria-checked={selected}
                disabled={disabled}
                onClick={() => isMulti ? handleMultiToggle(choice.id) : handleSingleSelect(choice.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  selected
                    ? "border-primary bg-primary/8"
                    : "border-border/70 bg-background/85 hover:border-primary/30 hover:bg-accent/25",
                  disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {isMulti ? (
                  <Checkbox
                    checked={selected}
                    className="mt-0.5 shrink-0 pointer-events-none"
                    tabIndex={-1}
                  />
                ) : (
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-300"
                    )}
                  >
                    {selected && "•"}
                  </span>
                )}
                <span className={cn("flex-1", selected ? "text-primary" : "text-gray-700 dark:text-gray-300")}>
                  <span className="font-mono text-xs font-semibold uppercase mr-2 opacity-50">
                    {choice.id}
                  </span>
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
