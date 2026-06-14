import { NextRequest, NextResponse } from "next/server";
import { GradeRequestSchema } from "@/lib/questions/schema";
import { getQuestionsByIds } from "@/lib/questions/loader";
import { gradeQuiz } from "@/lib/grading/engine";
import { initTracer } from "@/lib/datadog/tracer";
import { rateLimit, clientIp } from "@/lib/rate-limit";

initTracer();

export async function POST(req: NextRequest) {
  if (!rateLimit(`grade:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GradeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid grade request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { certificationId, questionIds, answers } = parsed.data;

  const questions = await getQuestionsByIds(questionIds, certificationId);
  if (questions.length === 0) {
    return NextResponse.json({ error: "No valid questions found" }, { status: 404 });
  }

  const results = await gradeQuiz(questions, answers as Record<string, string | string[]>, certificationId);

  console.log(
    JSON.stringify({
      level: "info",
      event: "quiz.graded",
      questionCount: questions.length,
      totalCorrect: results.totalCorrect,
      pct: results.pct,
      passed: results.passed,
    })
  );

  return NextResponse.json(results);
}
