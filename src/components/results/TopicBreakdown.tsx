"use client";

import { TopicScore, DifficultyScore } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import taxonomy from "@/data/taxonomy.json";

interface Props {
  byTopic: TopicScore[];
  byDifficulty: DifficultyScore[];
}

const topicLabelMap = new Map(taxonomy.topics.map((t) => [t.id, t.label]));

function getBarColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function TopicBreakdown({ byTopic, byDifficulty }: Props) {
  const sorted = [...byTopic].sort((a, b) => a.pct - b.pct);

  return (
    <Card className="brand-panel overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Score by Topic</CardTitle>
          <div className="flex flex-wrap gap-2">
            {byDifficulty.map((difficulty) => (
              <Badge key={difficulty.difficulty} variant="outline" className="capitalize">
                {difficulty.difficulty}: {difficulty.attempted > 0 ? `${difficulty.pct}%` : "—"}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((t) => (
          <div key={t.topicId} className="rounded-2xl border border-border/70 bg-background/78 p-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {topicLabelMap.get(t.topicId) ?? t.topicId}
              </span>
              <span className={cn("tabular-nums font-semibold", getBarColor(t.pct).replace("bg-", "text-"))}>
                {t.pct}%
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({t.correct}/{t.attempted})
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-[width]", getBarColor(t.pct))}
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
