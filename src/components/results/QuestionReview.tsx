"use client";

import { QuestionResult } from "@/types/quiz";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  questionResults: QuestionResult[];
}

export function QuestionReview({ questionResults }: Props) {
  if (questionResults.length === 0) {
    return (
      <Card className="brand-panel">
        <CardContent className="py-12 text-center text-muted-foreground">
          You got every question right!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questionResults.map((result, i) => (
        <Card key={result.questionId} className="brand-panel overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                ✗
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                  <Badge variant="outline" className="text-xs capitalize">{result.difficulty}</Badge>
                  {result.topics.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.prompt}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Answer comparison */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:bg-red-950/20">
                <p className="text-xs font-semibold text-red-600 mb-1">Your answer</p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  {formatAnswer(result.userAnswer, result.choices)}
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:bg-green-950/20">
                <p className="text-xs font-semibold text-green-600 mb-1">Correct answer</p>
                <p className="text-sm text-green-800 dark:text-green-300">
                  {formatAnswer(result.correctAnswer, result.choices)}
                </p>
              </div>
            </div>

            {/* All choices for context */}
            <div className="space-y-1 rounded-2xl border border-border/70 bg-background/70 p-2">
              {result.choices.map((choice) => {
                const isCorrect = Array.isArray(result.correctAnswer)
                  ? result.correctAnswer.includes(choice.id)
                  : result.correctAnswer === choice.id;
                const wasSelected = Array.isArray(result.userAnswer)
                  ? result.userAnswer.includes(choice.id)
                  : result.userAnswer === choice.id;

                return (
                  <div
                    key={choice.id}
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-3 py-2 text-sm",
                      isCorrect && "bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300",
                      wasSelected && !isCorrect && "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300"
                    )}
                  >
                    <span className="font-mono text-xs font-semibold uppercase opacity-50 mt-0.5">
                      {choice.id}
                    </span>
                    <span>{choice.text}</span>
                    {isCorrect && <span className="ml-auto text-green-600">✓</span>}
                    {wasSelected && !isCorrect && <span className="ml-auto text-red-500">✗</span>}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3">
              <p className="text-primary mb-1 text-xs font-semibold">Why your answer was wrong</p>
              <p className="text-sm text-foreground">{result.shortExplanation}</p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3">
              <p className="text-primary mb-1 text-xs font-semibold">Why the correct answer is right</p>
              <p className="text-sm text-foreground">{result.longExplanation}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Prepare for the next similar question</p>
              <p className="text-sm text-foreground">{result.preparationNote}</p>
              {result.studyPointers.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {result.studyPointers.map((pointer) => (
                    <li key={`${pointer.label}:${pointer.url ?? ""}`}>
                      {pointer.url ? (
                        <a
                          href={pointer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {pointer.label} ↗
                        </a>
                      ) : (
                        <span>{pointer.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatAnswer(
  answer: string | string[] | null,
  choices: { id: string; text: string }[]
): string {
  if (answer === null || answer === undefined) return "Not answered";
  const choiceMap = new Map(choices.map((c) => [c.id, c.text]));
  if (Array.isArray(answer)) {
    return answer.map((id) => choiceMap.get(id) ?? id).join(", ") || "Not answered";
  }
  return choiceMap.get(answer) ?? answer;
}
