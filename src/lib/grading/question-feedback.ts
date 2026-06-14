import taxonomy from "@/data/taxonomy.json";
import type { Question, QuestionResult, StudyPointer } from "@/types/quiz";

const topicMap = new Map(taxonomy.topics.map((topic) => [topic.id, topic]));

function getChoiceText(choiceId: string, question: Question): string {
  return question.choices.find((choice) => choice.id === choiceId)?.text ?? choiceId;
}

function formatAnswer(answer: string | string[] | null | undefined, question: Question): string {
  if (answer === null || answer === undefined) return "no answer was submitted";

  if (Array.isArray(answer)) {
    if (answer.length === 0) return "no answer was submitted";
    return answer.map((choiceId) => `"${getChoiceText(choiceId, question)}"`).join(", ");
  }

  return `"${getChoiceText(answer, question)}"`;
}

function formatCorrectAnswer(question: Question): string {
  return formatAnswer(question.correct, question);
}

function buildStudyPointers(question: Question): StudyPointer[] {
  const seen = new Set<string>();
  const pointers: StudyPointer[] = [];

  for (const topicId of question.topics) {
    const topic = topicMap.get(topicId);
    for (const pointer of topic?.studyPointers ?? []) {
      const key = `${pointer.label}:${pointer.url ?? ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        pointers.push(pointer);
      }
    }
  }

  for (const ref of question.refs ?? []) {
    const key = `${ref.label}:${ref.url ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      pointers.unshift(ref);
    }
  }

  return pointers.slice(0, 4);
}

function buildPreparationNote(question: Question): string {
  const topicDescriptions = question.topics
    .map((topicId) => topicMap.get(topicId))
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
    .map((topic) => `${topic.label}: ${topic.description}`);

  if (topicDescriptions.length > 0) {
    return `To prepare for similar questions, review these concepts next: ${topicDescriptions.join(" ")}`;
  }

  return "To prepare for similar questions, review the underlying concept and compare each distractor against the exact Datadog behavior or terminology.";
}

function buildWrongExplanation(
  question: Question,
  userAnswer: string | string[] | null | undefined
): string {
  if (userAnswer === null || userAnswer === undefined || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return `This was marked incorrect because ${formatAnswer(userAnswer, question)}; the expected answer was ${formatCorrectAnswer(question)}.`;
  }

  if (question.type === "multi_choice" && Array.isArray(question.correct)) {
    const selected = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const missing = question.correct.filter((choiceId) => !selected.includes(choiceId));
    const extra = selected.filter((choiceId) => !question.correct.includes(choiceId));

    const details = [
      missing.length > 0
        ? `you missed ${missing.map((choiceId) => `"${getChoiceText(choiceId, question)}"`).join(", ")}`
        : null,
      extra.length > 0
        ? `you included ${extra.map((choiceId) => `"${getChoiceText(choiceId, question)}"`).join(", ")}`
        : null,
    ].filter(Boolean);

    if (details.length > 0) {
      return `This was incorrect because multi-select questions require the exact set of correct choices; ${details.join(" and ")}.`;
    }
  }

  return `This was incorrect because you chose ${formatAnswer(userAnswer, question)} instead of ${formatCorrectAnswer(question)}.`;
}

export function gradeQuestion(
  question: Question,
  userAnswer: string | string[] | null | undefined
): boolean {
  if (userAnswer === null || userAnswer === undefined) return false;

  const correct = question.correct;

  if (question.type === "single_choice" || question.type === "true_false") {
    return typeof userAnswer === "string" && userAnswer === correct;
  }

  if (question.type === "multi_choice") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false;
    if (userAnswer.length !== correct.length) return false;
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correct].sort();
    return sortedUser.every((value, index) => value === sortedCorrect[index]);
  }

  return false;
}

export function buildQuestionResult(
  question: Question,
  userAnswer: string | string[] | null | undefined
): QuestionResult {
  const correct = gradeQuestion(question, userAnswer);

  return {
    questionId: question.id,
    correct,
    userAnswer: (userAnswer ?? null) as string | string[] | null,
    correctAnswer: question.correct,
    explanation: question.explanation,
    shortExplanation: correct
      ? `Correct. ${formatCorrectAnswer(question)} is the expected answer here.`
      : buildWrongExplanation(question, userAnswer),
    longExplanation: `The correct answer is ${formatCorrectAnswer(question)}. ${question.explanation}`,
    preparationNote: buildPreparationNote(question),
    studyPointers: buildStudyPointers(question),
    topics: question.topics,
    difficulty: question.difficulty,
    prompt: question.prompt,
    choices: question.choices,
  };
}
