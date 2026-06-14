"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuizStore } from "@/lib/store";
import { useHydrateSession } from "@/hooks/useHydrateSession";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export function InProgressQuizCard() {
  const {
    sessionId,
    questions,
    answers,
    currentIndex,
    results,
    abandonQuiz,
  } = useQuizStore();
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);

  useHydrateSession();

  const inProgress = Boolean(sessionId && questions.length > 0 && !results);
  if (!inProgress) return null;

  const answeredCount = Object.keys(answers).length;
  const nextQuestion = Math.min(currentIndex + 1, questions.length);

  return (
    <>
      <Card className="brand-shell mt-6 border-primary/25 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">You have an in-progress test.</p>
            <p className="brand-muted mt-1 text-sm">
              Continue on question {nextQuestion} of {questions.length}. {answeredCount} answered so
              far.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/quiz">Resume Test</Link>
            </Button>
            <Button variant="outline" onClick={() => setShowAbandonDialog(true)}>
              Abandon Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abandon this in-progress test?</DialogTitle>
          </DialogHeader>
          <p className="brand-muted py-2 text-sm">
            This will permanently clear your current test progress from this browser session.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbandonDialog(false)}>
              Keep Test
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                abandonQuiz();
                setShowAbandonDialog(false);
              }}
            >
              Abandon Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
