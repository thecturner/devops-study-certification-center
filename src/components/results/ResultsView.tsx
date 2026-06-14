"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store";
import { useHydrateSession } from "@/hooks/useHydrateSession";
import { ScoreCard } from "./ScoreCard";
import { TopicBreakdown } from "./TopicBreakdown";
import { QuestionReview } from "./QuestionReview";
import { StudyGuide } from "./StudyGuide";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

export function ResultsView() {
  const router = useRouter();
  const { results, config, questions, resetQuiz, startQuiz } = useQuizStore();
  const leaving = useRef(false);

  useHydrateSession();

  useEffect(() => {
    if (!results && !leaving.current) {
      router.replace("/");
    }
  }, [results, router]);

  if (!results) return null;

  const wrongResults = results.questionResults.filter((result) => !result.correct);
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const missedQuestions = wrongResults.flatMap((result) => {
    const question = questionMap.get(result.questionId);
    return question ? [question] : [];
  });

  function handleRetake() {
    leaving.current = true;
    resetQuiz();
    router.push("/configure");
  }

  function handleRetryMissed() {
    if (!config || missedQuestions.length === 0) return;
    leaving.current = true;
    startQuiz(
      crypto.randomUUID(),
      {
        ...config,
        count: missedQuestions.length,
        learningMode: true,
      },
      missedQuestions
    );
    router.push("/quiz");
  }

  return (
    <div className="app-surface pb-16">
      {/* Header */}
      <header className="brand-shell border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">
            ← Home
          </Link>
          <div className="flex items-center gap-4">
            <BrandLockup className="hidden sm:flex" certId={config?.certificationId} />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Quiz Results</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetryMissed}
              disabled={missedQuestions.length === 0}
            >
              Retry Missed
            </Button>
            <Button size="sm" onClick={handleRetake}>
              New Quiz
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Score card */}
        <ScoreCard results={results} />

        {missedQuestions.length > 0 && (
          <div className="brand-panel mt-6 flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="brand-kicker mb-2">Targeted Retry</p>
              <p className="text-sm text-foreground">
                Restart with only the {missedQuestions.length} question
                {missedQuestions.length !== 1 ? "s" : ""} you missed.
              </p>
              <p className="brand-muted mt-1 text-sm">
                This retry launches in learning mode so the next pass becomes a remediation loop instead of another blind assessment.
              </p>
            </div>
            <Button onClick={handleRetryMissed}>Retry Missed Questions</Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="study-guide" className="mt-8">
          <TabsList className="brand-shell h-auto w-full rounded-2xl p-1.5">
            <TabsTrigger value="study-guide" className="flex-1">Study Guide</TabsTrigger>
            <TabsTrigger value="topics" className="flex-1">Topic Breakdown</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">
              Review ({wrongResults.length} wrong)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study-guide" className="mt-4">
            <StudyGuide guide={results.studyGuide} />
          </TabsContent>

          <TabsContent value="topics" className="mt-4">
            <TopicBreakdown
              byTopic={results.byTopic}
              byDifficulty={results.byDifficulty}
            />
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            <QuestionReview
              questionResults={wrongResults}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
