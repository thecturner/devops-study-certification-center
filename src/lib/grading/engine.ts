import {
  Question,
  QuizResults,
  TopicScore,
  DifficultyScore,
  Difficulty,
  AnswerMap,
  CertificationId,
} from "@/types/quiz";
import { generateStudyGuide } from "@/lib/study-guide/generator";
import { buildQuestionResult } from "./question-feedback";
import { PASS_THRESHOLD_PCT } from "@/lib/constants";

/**
 * Grade a full quiz.
 */
export async function gradeQuiz(
  questions: Question[],
  answers: AnswerMap,
  certId: CertificationId = "datadog-fundamentals"
): Promise<QuizResults> {
  // Per-question results
  const questionResults = questions.map((question) =>
    buildQuestionResult(question, answers[question.id] ?? null)
  );

  const totalCorrect = questionResults.filter((r) => r.correct).length;
  const totalQuestions = questions.length;
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // By topic
  const topicMap = new Map<string, { correct: number; attempted: number }>();
  for (const r of questionResults) {
    for (const topic of r.topics) {
      if (!topicMap.has(topic)) topicMap.set(topic, { correct: 0, attempted: 0 });
      const entry = topicMap.get(topic)!;
      entry.attempted++;
      if (r.correct) entry.correct++;
    }
  }
  const byTopic: TopicScore[] = [...topicMap.entries()].map(([topicId, data]) => ({
    topicId,
    label: topicId,
    attempted: data.attempted,
    correct: data.correct,
    pct: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
  }));

  // By difficulty
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const byDifficulty: DifficultyScore[] = difficulties.map((diff) => {
    const filtered = questionResults.filter((r) => r.difficulty === diff);
    const correct = filtered.filter((r) => r.correct).length;
    return {
      difficulty: diff,
      attempted: filtered.length,
      correct,
      pct: filtered.length > 0 ? Math.round((correct / filtered.length) * 100) : 0,
    };
  });

  const studyGuide = await generateStudyGuide(byTopic, questionResults, certId);

  return {
    totalQuestions,
    totalCorrect,
    pct,
    passed: pct >= PASS_THRESHOLD_PCT,
    byTopic,
    byDifficulty,
    questionResults,
    studyGuide,
  };
}
