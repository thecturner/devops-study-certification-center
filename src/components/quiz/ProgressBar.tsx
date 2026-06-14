"use client";

import { Progress } from "@/components/ui/progress";

interface Props {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="min-w-[10rem] rounded-full border border-border/60 bg-background/70 px-3 py-2">
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Progress</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2.5 w-full" />
    </div>
  );
}
