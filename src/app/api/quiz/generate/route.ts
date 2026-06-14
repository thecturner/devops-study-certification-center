import { NextRequest, NextResponse } from "next/server";
import { QuizConfigSchema } from "@/lib/questions/schema";
import { selectQuestions } from "@/lib/questions/selector";
import { initTracer } from "@/lib/datadog/tracer";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

initTracer();

export async function POST(req: NextRequest) {
  if (!rateLimit(`generate:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = QuizConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const config = parsed.data;
  const sessionId = randomUUID();
  const seed = Date.now(); // use timestamp as seed for variety

  const questions = await selectQuestions(config, seed);

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions match the selected filters. Try broadening your criteria." },
      { status: 404 }
    );
  }

  console.log(
    JSON.stringify({
      level: "info",
      event: "quiz.generated",
      sessionId,
      questionCount: questions.length,
      topics: config.topics,
      difficulty: config.difficulty,
      learningMode: config.learningMode,
    })
  );

  return NextResponse.json({ sessionId, questions, config });
}
