"use client";

import { useQuizStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function QuestionNav() {
  const { questions, answers, flagged, currentIndex, setCurrentIndex } = useQuizStore();

  function getStatus(questionId: string, index: number) {
    const answered = answers[questionId] !== undefined;
    const isFlagged = flagged.includes(questionId);
    const isCurrent = index === currentIndex;
    return { answered, isFlagged, isCurrent };
  }

  return (
    <div className="brand-panel brand-grid p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Questions
      </h2>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="bg-primary inline-block h-3 w-3 rounded-sm" />
          Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-amber-400 bg-amber-100" />
          Flagged
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-gray-300" />
          Skipped
        </span>
      </div>
      <ScrollArea className="h-64">
        <div className="grid grid-cols-5 gap-1">
          {questions.map((q, i) => {
            const { answered, isFlagged, isCurrent } = getStatus(q.id, i);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Question ${i + 1}${answered ? " (answered)" : ""}${isFlagged ? " (flagged)" : ""}`}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "h-9 w-full rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  isCurrent && "ring-2 ring-ring shadow-sm",
                  answered && !isFlagged && "bg-primary text-primary-foreground",
                  isFlagged && "border border-amber-400 bg-amber-100 text-amber-800",
                  !answered && !isCurrent && "border border-border/70 bg-background/80 text-muted-foreground hover:border-primary/30 hover:bg-accent/30"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-3 text-xs text-muted-foreground">
        {Object.keys(answers).length} / {questions.length} answered
      </div>
    </div>
  );
}
