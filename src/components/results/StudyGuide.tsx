"use client";

import { StudyGuide as StudyGuideType } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Props {
  guide: StudyGuideType;
}

export function StudyGuide({ guide }: Props) {
  const { weakTopics, nextSteps } = guide;

  if (weakTopics.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Strong performance across all topics! No specific weak areas identified.
          Consider increasing the difficulty or trying a larger quiz.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Next steps */}
      <Card className="border-primary/20 bg-primary/8">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-sm">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="bg-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                {step}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weak topics */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Focus Areas ({weakTopics.length})
      </h3>
      {weakTopics.map((topic) => (
        <Card key={topic.topicId} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{topic.label}</CardTitle>
              <Badge
                variant="outline"
                className={
                  topic.pct < 50
                    ? "border-red-300 text-red-600"
                    : "border-yellow-300 text-yellow-600"
                }
              >
                {topic.pct}% ({topic.correct}/{topic.attempted})
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Study pointers */}
            {topic.studyPointers.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-500">Study Resources</p>
                <ul className="space-y-1">
                  {topic.studyPointers.map((pointer, i) => (
                    <li key={i} className="text-sm">
                      {pointer.url ? (
                        <Link
                          href={pointer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {pointer.label} ↗
                        </Link>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{pointer.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topic.examScenarios.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-500">Exam-Style Scenarios</p>
                <div className="space-y-2">
                  {topic.examScenarios.map((scenario, i) => (
                    <div key={`${topic.topicId}-scenario-${i}`} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground">{scenario.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{scenario.prompt}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Focus: {scenario.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missed questions */}
            {topic.missedQuestionIds.length > 0 && (
              <div>
                <p className="text-xs text-gray-400">
                  Missed {topic.missedQuestionIds.length} question
                  {topic.missedQuestionIds.length !== 1 ? "s" : ""} in this topic.
                  Review them in the &quot;Review&quot; tab above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
