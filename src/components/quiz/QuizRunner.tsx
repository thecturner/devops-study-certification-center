"use client";

import { useEffect, useState } from "react";
import { useHydrateSession } from "@/hooks/useHydrateSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/lib/store";
import { QuestionCard } from "./QuestionCard";
import { QuestionNav } from "./QuestionNav";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trackQuizSubmitted } from "@/lib/datadog/rum";
import { BrandLockup } from "@/components/BrandLockup";
import { LearningFeedbackPanel } from "./LearningFeedbackPanel";

export function QuizRunner() {
  const router = useRouter();
  const {
    sessionId,
    questions,
    answers,
    config,
    checkedQuestionIds,
    flagged,
    learningFeedback,
    currentIndex,
    markQuestionChecked,
    setCurrentIndex,
    submitQuiz,
    abandonQuiz,
  } = useQuizStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useHydrateSession();

  useEffect(() => {
    if (questions.length === 0 && !sessionId) {
      router.replace("/");
    }
  }, [questions.length, sessionId, router]);

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const learningMode = config?.learningMode ?? false;
  const isCurrentChecked = currentQuestion
    ? checkedQuestionIds.includes(currentQuestion.id)
    : false;
  const currentFeedback = currentQuestion ? learningFeedback[currentQuestion.id] : null;

  async function handleCheckAnswer() {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.id];
    const isEmptyAnswer =
      answer === undefined ||
      answer === null ||
      (Array.isArray(answer) && answer.length === 0);

    if (isEmptyAnswer) {
      setInlineError("Select an answer before checking this question.");
      return;
    }

    setCheckingAnswer(true);
    setInlineError(null);
    try {
      const res = await fetch("/api/quiz/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificationId: config?.certificationId ?? "datadog-fundamentals",
          questionId: currentQuestion.id,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInlineError(data.error ?? "Unable to check this answer right now.");
        return;
      }
      markQuestionChecked(currentQuestion.id, data.result);
    } catch {
      setInlineError("Network error. Please try again.");
    } finally {
      setCheckingAnswer(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificationId: config?.certificationId ?? "datadog-fundamentals",
          questionIds: questions.map((question) => question.id),
          answers,
        }),
      });
      const results = await res.json();
      if (!res.ok) {
        setShowSubmitDialog(false);
        setInlineError("Grading failed. Please try again.");
        return;
      }
      submitQuiz(results);
      if (sessionId) {
        trackQuizSubmitted(sessionId, results.pct, results.totalQuestions);
      }
      router.push("/results");
    } catch {
      setShowSubmitDialog(false);
      setInlineError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isServiceNow = config?.certificationId?.startsWith("servicenow") ?? false;

  return (
    <div className={`app-surface${isServiceNow ? " vendor-servicenow" : ""}`}>
      <header className="brand-shell sticky top-0 z-10 border-b">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <BrandLockup className="hidden sm:flex" certId={config?.certificationId} />
            <div className="rounded-full border border-border/60 bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <ProgressBar value={answeredCount} max={questions.length} />
            <span className="text-xs text-muted-foreground">{answeredCount} answered</span>
            {learningMode && (
              <span className="rounded-full border border-primary/25 bg-primary/8 px-3 py-2 text-xs font-medium text-primary">
                Learning mode
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/">Home</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAbandonDialog(true)}>
              Abandon Test
            </Button>
            <Button size="sm" onClick={() => setShowSubmitDialog(true)} disabled={submitting}>
              Submit Quiz
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
        <main>
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              isFlagged={flagged.includes(currentQuestion.id)}
              disabled={learningMode && isCurrentChecked}
            />
          )}

          {learningMode && currentFeedback && <LearningFeedbackPanel result={currentFeedback} />}

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setInlineError(null);
                setCurrentIndex(Math.max(0, currentIndex - 1));
              }}
              disabled={currentIndex === 0}
            >
              ← Previous
            </Button>
            {learningMode && !isCurrentChecked ? (
              <Button onClick={handleCheckAnswer} disabled={checkingAnswer}>
                {checkingAnswer ? "Checking…" : "Check Answer"}
              </Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button
                onClick={() => {
                  setInlineError(null);
                  setCurrentIndex(currentIndex + 1);
                }}
              >
                Next →
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitDialog(true)}>
                Finish & Submit
              </Button>
            )}
          </div>

          {inlineError && (
            <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {inlineError}
            </p>
          )}
        </main>

        <aside className="mt-6 lg:mt-0">
          <QuestionNav />
        </aside>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
          </DialogHeader>
          <div className="brand-muted py-2 text-sm">
            {unansweredCount > 0 ? (
              <p>
                You have <strong>{unansweredCount}</strong> unanswered question
                {unansweredCount !== 1 ? "s" : ""}. Unanswered questions will be
                marked incorrect. Are you sure you want to submit?
              </p>
            ) : (
              <p>All {questions.length} questions answered. Ready to submit?</p>
            )}
            {flagged.length > 0 && (
              <p className="mt-2 text-amber-600">
                You have {flagged.length} question{flagged.length !== 1 ? "s" : ""} flagged for review.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Go back
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abandon this test?</DialogTitle>
          </DialogHeader>
          <div className="brand-muted py-2 text-sm">
            <p>
              This will clear your current answers and progress from this browser session.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbandonDialog(false)}>
              Keep Test
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                abandonQuiz();
                setShowAbandonDialog(false);
                router.push("/");
              }}
            >
              Abandon Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
