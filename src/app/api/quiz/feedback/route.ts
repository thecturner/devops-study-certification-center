import { NextRequest, NextResponse } from "next/server";
import { FeedbackRequestSchema } from "@/lib/questions/schema";
import { getQuestionsByIds } from "@/lib/questions/loader";
import { buildQuestionResult } from "@/lib/grading/question-feedback";
import { initTracer } from "@/lib/datadog/tracer";
import { rateLimit, clientIp } from "@/lib/rate-limit";

initTracer();

export async function POST(req: NextRequest) {
  if (!rateLimit(`feedback:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FeedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid feedback request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const [question] = await getQuestionsByIds([parsed.data.questionId], parsed.data.certificationId);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({
    result: buildQuestionResult(question, parsed.data.answer),
  });
}
