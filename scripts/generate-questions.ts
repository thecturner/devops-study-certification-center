#!/usr/bin/env tsx
/**
 * scripts/generate-questions.ts
 *
 * Fetches a documentation page and uses Claude to generate CCAF exam questions.
 *
 * Usage:
 *   tsx scripts/generate-questions.ts \
 *     --url <url> --topic <slug> --cert <certId> \
 *     --id-prefix <prefix> [--start-id <n>] [--count <n>]
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { z } from "zod";

// ─── Schema (mirrors src/lib/questions/schema.ts) ────────────────────────────

const ChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["single_choice", "multi_choice", "true_false"]),
  prompt: z.string().min(1),
  choices: z.array(ChoiceSchema).min(2),
  correct: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().min(1),
  topics: z.array(z.string()).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  refs: z
    .array(z.object({ label: z.string().min(1), url: z.string().url().optional() }))
    .optional(),
  version: z.number().int().positive().default(1),
});

type ValidQuestion = z.infer<typeof QuestionSchema>;

// ─── CLI argument parser ──────────────────────────────────────────────────────

interface Args {
  url: string;
  topic: string;
  cert: string;
  "id-prefix": string;
  "start-id": number;
  count: number;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const result: Record<string, string | number> = {};

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--") && i + 1 < argv.length) {
      result[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }

  if (!result.url || !result.topic || !result.cert || !result["id-prefix"]) {
    console.error(
      "Usage: tsx scripts/generate-questions.ts " +
        "--url <url> --topic <slug> --cert <certId> " +
        "--id-prefix <prefix> [--start-id <n>] [--count <n>]"
    );
    process.exit(1);
  }

  return {
    url: String(result.url),
    topic: String(result.topic),
    cert: String(result.cert),
    "id-prefix": String(result["id-prefix"]),
    "start-id": Number(result["start-id"]) || 1,
    count: Number(result.count) || 5,
  };
}

// ─── HTML → text ─────────────────────────────────────────────────────────────

function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── index.ts updater ────────────────────────────────────────────────────────

function ensureTopicInIndex(certQuestionsDir: string, topic: string): void {
  const indexPath = join(certQuestionsDir, "index.ts");
  if (!existsSync(indexPath)) return;

  const content = readFileSync(indexPath, "utf-8");
  if (content.includes(`"${topic}"`)) return;

  // kebab-case → camelCase for the import variable name
  const varName = topic.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

  // Insert import after the last existing import line
  const lastImportEnd = (() => {
    let pos = 0;
    let cursor = 0;
    while ((cursor = content.indexOf("import ", cursor)) !== -1) {
      const lineEnd = content.indexOf("\n", cursor);
      pos = lineEnd + 1;
      cursor = lineEnd + 1;
    }
    return pos;
  })();

  const newImport = `import ${varName} from "./${topic}.json";\n`;

  // Insert entry before the closing `};` of QUESTION_BANK
  const bankClose = content.lastIndexOf("};");
  const newEntry = `  "${topic}": ${varName},\n`;

  let updated =
    content.slice(0, lastImportEnd) +
    newImport +
    content.slice(lastImportEnd);

  const newBankClose = updated.lastIndexOf("};");
  updated =
    updated.slice(0, newBankClose) + newEntry + updated.slice(newBankClose);

  writeFileSync(indexPath, updated, "utf-8");
  console.log(`[index] Added "${topic}" import to ${indexPath}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();
  const { url, topic, cert, count } = args;
  const idPrefix = args["id-prefix"];
  const startId = args["start-id"];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set");
    process.exit(1);
  }

  // 1. Fetch documentation page
  console.log(`[fetch] ${url}`);
  const fetchResponse = await fetch(url);
  if (!fetchResponse.ok) {
    console.error(`[fetch] HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
    process.exit(1);
  }
  const html = await fetchResponse.text();
  const text = extractText(html);
  console.log(`[fetch] Extracted ${text.length.toLocaleString()} characters`);

  if (text.length < 200) {
    console.error("[fetch] Page content is too short — may require JavaScript rendering");
    process.exit(1);
  }

  // 2. Generate questions via Claude
  const client = new Anthropic({ apiKey });

  const idPadWidth = String(startId + count - 1).length;
  const idList = Array.from({ length: count }, (_, i) =>
    `${idPrefix}-${String(startId + i).padStart(Math.max(3, idPadWidth), "0")}`
  );

  const systemPrompt =
    "You are a certification exam question writer. Generate MCQ questions from the " +
    "provided documentation page. Focus heavily on gotchas, anti-patterns, and common " +
    "mistakes the docs explicitly warn about — those make the best distractors.";

  const userPrompt =
    `Generate ${count} multiple-choice exam questions from this documentation. ` +
    `Each question needs 1 correct answer and 3 plausible-but-wrong distractors ` +
    `using real terminology from the docs. Weight toward edge cases and things the ` +
    `docs call out as wrong approaches.\n\n` +
    `Output ONLY a JSON array — no markdown fences, no explanation — matching this schema:\n` +
    `[{id, type, prompt, choices:[{id,text}], correct, explanation, topics, difficulty, refs, version}]\n\n` +
    `Requirements:\n` +
    `- Use these IDs in order: ${idList.join(", ")}\n` +
    `- topics array must include "${topic}"\n` +
    `- type must be "single_choice"\n` +
    `- version must be 1\n` +
    `- choices must have exactly 4 items with ids "a","b","c","d"\n` +
    `- correct must be a single choice id string\n` +
    `- difficulty: spread across easy/medium/hard\n\n` +
    `Documentation:\n${text.slice(0, 28000)}`;

  console.log(`[claude] Requesting ${count} questions (model: claude-sonnet-4-6)...`);
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // 3. Extract JSON array from response
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[parse] No JSON array found in Claude response");
    console.error("[parse] Raw response:", rawText.slice(0, 800));
    process.exit(1);
  }

  let parsed: unknown[];
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[parse] Failed to parse JSON:", err);
    console.error("[parse] Extracted text:", jsonMatch[0].slice(0, 500));
    process.exit(1);
  }

  // 4. Validate each question against the schema
  const valid: ValidQuestion[] = [];
  for (const item of parsed) {
    const result = QuestionSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      const id = (item as { id?: string })?.id ?? "(unknown)";
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      console.warn(`[validate] Skipped "${id}": ${issues}`);
    }
  }

  console.log(`[validate] ${valid.length}/${parsed.length} questions passed schema validation`);

  if (valid.length === 0) {
    console.error("[validate] No valid questions to write — aborting");
    process.exit(1);
  }

  // 5. Merge into target JSON file
  const certQuestionsDir = join(
    process.cwd(),
    "src",
    "data",
    "certifications",
    cert,
    "questions"
  );
  const filePath = join(certQuestionsDir, `${topic}.json`);

  let existing: Array<{ id?: string }> = [];
  if (existsSync(filePath)) {
    try {
      existing = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
      console.warn(`[merge] Could not parse ${filePath}; starting fresh`);
    }
  }

  const existingIds = new Set(existing.map((q) => q.id));
  const toAdd = valid.filter((q) => !existingIds.has(q.id));
  const merged = [...existing, ...toAdd];

  if (toAdd.length === 0) {
    console.log("[merge] All generated questions already exist — nothing to write");
  } else {
    writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n", "utf-8");
    console.log(
      `[write] Added ${toAdd.length} questions to ${filePath} (${merged.length} total)`
    );
  }

  // 6. Ensure the topic is in the cert's index.ts
  ensureTopicInIndex(certQuestionsDir, topic);

  // 7. Confirm existing datadog questions still pass
  console.log("[post] Running npm run validate-questions...");
  try {
    execSync("npm run validate-questions", { stdio: "inherit" });
  } catch {
    console.error("[post] validate-questions failed after write");
    process.exit(1);
  }

  console.log(`\nDone. ${toAdd.length} new questions written to ${filePath}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
