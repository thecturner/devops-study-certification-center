"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import type { QuestionResult } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  result: QuestionResult;
}

export function LearningFeedbackPanel({ result }: Props) {
  return (
    <Card className="brand-panel mt-6 overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="brand-kicker mb-2">Learning Feedback</p>
            <CardTitle className="text-lg">
              {result.correct ? "Answer confirmed" : "Review this concept before moving on"}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={
              result.correct
                ? "gap-1 border-green-300 bg-green-100 font-semibold text-green-900 dark:border-green-700 dark:bg-green-950/55 dark:text-green-100"
                : "gap-1 border-red-300 bg-red-100 font-semibold text-red-900 dark:border-red-700 dark:bg-red-950/55 dark:text-red-100"
            }
          >
            {result.correct ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <XCircle className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>{result.correct ? "Correct" : "Incorrect"}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Why your answer was graded this way
          </p>
          <p className="text-sm text-foreground">{result.shortExplanation}</p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Why the correct answer is right
          </p>
          <p className="text-sm text-foreground">{result.longExplanation}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Prepare for similar questions
          </p>
          <p className="text-sm text-foreground">{result.preparationNote}</p>
          {result.studyPointers.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {result.studyPointers.map((pointer) => (
                <li key={`${pointer.label}:${pointer.url ?? ""}`}>
                  {pointer.url ? (
                    <Link
                      href={pointer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {pointer.label} ↗
                    </Link>
                  ) : (
                    <span className="text-foreground">{pointer.label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
