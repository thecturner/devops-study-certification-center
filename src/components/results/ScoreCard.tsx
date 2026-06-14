"use client";

import { QuizResults } from "@/types/quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PASS_THRESHOLD_PCT } from "@/lib/constants";

interface Props {
  results: QuizResults;
}

export function ScoreCard({ results }: Props) {
  const { pct, passed, totalCorrect, totalQuestions } = results;

  return (
    <Card className="brand-panel overflow-hidden">
      <div
        className={cn(
          "brand-grid px-6 py-8 text-center",
          passed
            ? "bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(255,255,255,0.7))] dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(26,34,52,0.72))]"
            : "bg-[linear-gradient(180deg,rgba(239,68,68,0.14),rgba(255,255,255,0.7))] dark:bg-[linear-gradient(180deg,rgba(239,68,68,0.18),rgba(26,34,52,0.72))]"
        )}
      >
        <p className="brand-kicker mb-3">Assessment Summary</p>
        <div className="mb-3">
          <Badge className={cn("text-sm", passed ? "bg-green-600" : "bg-red-500")}>
            {passed ? "Passed" : "Needs Work"}
          </Badge>
        </div>
        <div className={cn("text-6xl font-bold tabular-nums", passed ? "text-green-600" : "text-red-500")}>
          {pct}%
        </div>
        <p className="mt-2 text-muted-foreground">
          {totalCorrect} correct out of {totalQuestions} questions
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Pass threshold: {PASS_THRESHOLD_PCT}%</p>
      </div>

      <CardContent className="grid grid-cols-3 gap-3 py-5">
        {results.byDifficulty.map((d) => (
          <div key={d.difficulty} className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {d.attempted > 0 ? `${d.pct}%` : "—"}
            </p>
            <p className="text-xs capitalize text-muted-foreground">{d.difficulty}</p>
            <p className="text-xs text-muted-foreground">
              {d.correct}/{d.attempted}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
