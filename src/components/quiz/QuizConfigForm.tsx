"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuizStore } from "@/lib/store";
import { trackQuizStarted } from "@/lib/datadog/rum";
import type { TaxonomyTopic, CertificationId } from "@/types/quiz";

const ALL_PRESET_COUNTS = [10, 25, 50];
const BUILD_MODES = [
  {
    id: "auto",
    label: "Auto Mix",
    description: "Recommended. Choose a count and the quiz builder will balance the mix for you.",
  },
  {
    id: "custom",
    label: "Custom Filters",
    description: "Manually narrow the quiz by topic and difficulty.",
  },
] as const;

type ConfigFormValues = {
  count: number;
  topics: string[];
  difficulty: "all" | "easy" | "medium" | "hard";
  balanced: boolean;
  learningMode: boolean;
};

interface QuizConfigFormProps {
  certId?: CertificationId;
  maxQuestions?: number;
}

export function QuizConfigForm({ certId = "datadog-fundamentals", maxQuestions = 200 }: QuizConfigFormProps) {
  const router = useRouter();
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const [topics, setTopics] = useState<TaxonomyTopic[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customCount, setCustomCount] = useState(false);
  const [buildMode, setBuildMode] = useState<"auto" | "custom">("auto");

  const configFormSchema = z.object({
    count: z.number().min(1).max(maxQuestions),
    topics: z.array(z.string()),
    difficulty: z.enum(["all", "easy", "medium", "hard"]),
    balanced: z.boolean(),
    learningMode: z.boolean(),
  });

  const presetCounts = ALL_PRESET_COUNTS.filter((n) => n <= maxQuestions);

  const { control, handleSubmit, watch, setValue } = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      count: 25,
      topics: [],
      difficulty: "all",
      balanced: true,
      learningMode: false,
    },
  });

  const selectedTopics = watch("topics");
  const currentCount = watch("count");
  const learningMode = watch("learningMode");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch(`/api/topics?cert=${certId}`)
      .then((r) => r.json())
      .then((data) => setTopics(data.topics ?? []))
      .catch(() => setTopics([]));
  }, [certId]);

  function toggleTopic(topicId: string) {
    const current = selectedTopics ?? [];
    const next = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId];
    setValue("topics", next);
  }

  async function onSubmit(values: ConfigFormValues) {
    setLoading(true);
    setError(null);
    try {
      const payload =
        buildMode === "auto"
          ? {
              certificationId: certId,
              ...values,
              topics: [],
              difficulty: "all" as const,
              balanced: true,
              types: [],
            }
          : { certificationId: certId, ...values, types: [] };

      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate quiz.");
        return;
      }
      startQuiz(data.sessionId, payload, data.questions);
      trackQuizStarted(data.sessionId, payload);
      router.push("/quiz");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="brand-shell">
        <CardHeader>
          <CardTitle className="text-base">How should the quiz be built?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {BUILD_MODES.map((mode) => {
            const selected = buildMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setBuildMode(mode.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  selected
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
                }`}
                aria-pressed={selected}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{mode.label}</p>
                    <p className="brand-muted mt-1 text-sm">{mode.description}</p>
                  </div>
                  {selected && (
                    <Badge variant="secondary" className="shrink-0">
                      Active
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="brand-shell">
        <CardHeader>
          <CardTitle className="text-base">Quiz experience</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="learningMode"
            control={control}
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    !field.value
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">Assessment</p>
                  <p className="brand-muted mt-1 text-sm">
                    Exam-style flow. Review explanations after submission.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                    field.value
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">Learning Mode</p>
                  <p className="brand-muted mt-1 text-sm">
                    Check each answer as you go and get immediate remediation when you miss.
                  </p>
                </button>
              </div>
            )}
          />
          <p className="brand-muted mt-3 text-xs">
            {learningMode
              ? "Learning mode reveals why an answer was wrong, why the correct answer is right, and what to study next."
              : "Assessment mode keeps the quiz closer to the certification experience."}
          </p>
        </CardContent>
      </Card>

      {/* Question count */}
      <Card className="brand-shell">
        <CardHeader>
          <CardTitle className="text-base">How many questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="count"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {presetCounts.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={field.value === n && !customCount ? "default" : "outline"}
                    onClick={() => {
                      field.onChange(n);
                      setCustomCount(false);
                    }}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={customCount ? "default" : "outline"}
                  onClick={() => setCustomCount(true)}
                >
                  Custom
                </Button>
                {customCount && (
                  <input
                    type="number"
                    min={1}
                    max={maxQuestions}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(Math.min(Number(e.target.value), maxQuestions))
                    }
                    className="w-24 rounded-md border border-input px-3 py-2 text-sm"
                    autoFocus
                  />
                )}
              </div>
            )}
          />
          <p className="brand-muted mt-2 text-xs">
            {currentCount} question{currentCount !== 1 ? "s" : ""} of {maxQuestions} available.{" "}
            {buildMode === "auto"
              ? "We will choose a balanced cross-domain mix automatically."
              : "Your custom filters below will shape the quiz."}
          </p>
        </CardContent>
      </Card>

      {buildMode === "custom" ? (
        <>
          {/* Topics */}
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle className="text-base">
                Topics{" "}
                <span className="brand-muted font-normal">(leave blank for all)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const selected = selectedTopics?.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/40"
                      }`}
                      aria-pressed={selected}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
              {selectedTopics?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedTopics.map((id) => {
                    const topic = topics.find((x) => x.id === id);
                    return topic ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {topic.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle className="text-base">Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {(["all", "easy", "medium", "hard"] as const).map((difficulty) => (
                      <Button
                        key={difficulty}
                        type="button"
                        variant={field.value === difficulty ? "default" : "outline"}
                        onClick={() => field.onChange(difficulty)}
                        className="capitalize"
                      >
                        {difficulty === "all" ? "All levels" : difficulty}
                      </Button>
                    ))}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Balanced */}
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle className="text-base">Question distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="balanced"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => field.onChange(true)}
                    >
                      Balanced across topics
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      onClick={() => field.onChange(false)}
                    >
                      Random
                    </Button>
                  </div>
                )}
              />
              <p className="brand-muted mt-2 text-xs">
                Balanced distributes questions more evenly across the selected topics.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="brand-shell border-primary/20 bg-primary/6">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-foreground">Auto Mix is active.</p>
            <p className="brand-muted mt-2 text-sm">
              Topic filters and difficulty controls are skipped so the selector can produce
              a broader, more exam-like spread of questions.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={!mounted || loading}>
        {loading ? "Generating quiz…" : "Start Quiz"}
      </Button>
    </form>
  );
}
