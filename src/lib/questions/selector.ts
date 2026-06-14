import { Question, QuizConfig, ClientQuestion } from "@/types/quiz";
import { loadQuestionBank } from "./loader";
import type { CertificationId } from "@/types/quiz";

/** Seeded pseudo-random number generator (mulberry32) */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Strip correct answers + explanation before sending to client. */
function toClientQuestion(q: Question): ClientQuestion {
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    choices: q.choices,
    topics: q.topics,
    difficulty: q.difficulty,
  };
}

/**
 * Select questions according to config.
 * Returns ClientQuestion[] (no correct answers).
 */
export async function selectQuestions(
  config: QuizConfig,
  seed: number
): Promise<ClientQuestion[]> {
  const certId: CertificationId = config.certificationId ?? "datadog-fundamentals";
  const bank = await loadQuestionBank(certId);
  const rand = mulberry32(seed);

  // 1. Filter
  const pool = bank.filter((q) => {
    if (config.difficulty !== "all" && q.difficulty !== config.difficulty) return false;
    if (config.types.length > 0 && !config.types.includes(q.type)) return false;
    if (config.topics.length > 0 && !q.topics.some((t) => config.topics.includes(t))) return false;
    return true;
  });

  if (pool.length === 0) {
    return [];
  }

  const count = Math.min(config.count, pool.length);

  let selected: Question[];

  if (config.balanced && config.topics.length !== 1) {
    selected = selectBalanced(pool, count, config.topics, rand);
  } else {
    selected = shuffle(pool, rand).slice(0, count);
  }

  // Final shuffle of the selected set
  return shuffle(selected, rand).map(toClientQuestion);
}

/**
 * Balanced selection: distribute questions roughly evenly across topics.
 * Falls back to random fill if a topic has too few questions.
 */
function selectBalanced(
  pool: Question[],
  count: number,
  topics: string[],
  rand: () => number
): Question[] {
  // Determine effective topic list
  const activeTopic =
    topics.length > 0
      ? topics
      : [...new Set(pool.flatMap((q) => q.topics))];

  const perTopic = Math.max(1, Math.floor(count / activeTopic.length));
  const selected = new Set<Question>();
  const usedIds = new Set<string>();

  for (const topic of activeTopic) {
    const topicPool = shuffle(
      pool.filter((q) => q.topics.includes(topic) && !usedIds.has(q.id)),
      rand
    );
    const take = Math.min(perTopic, topicPool.length);
    for (let i = 0; i < take && selected.size < count; i++) {
      selected.add(topicPool[i]);
      usedIds.add(topicPool[i].id);
    }
  }

  // Fill remainder from any topic
  if (selected.size < count) {
    const remainder = shuffle(
      pool.filter((q) => !usedIds.has(q.id)),
      rand
    );
    for (const q of remainder) {
      if (selected.size >= count) break;
      selected.add(q);
      usedIds.add(q.id);
    }
  }

  return [...selected];
}
