#!/usr/bin/env tsx
/**
 * Validates the question bank: schema, unique IDs, correct answer references.
 * Run via: npm run validate-questions
 */
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";

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
  refs: z.array(z.object({ label: z.string(), url: z.string().optional() })).optional(),
  version: z.number().int().positive(),
});

const DOMAINS = [
  "metrics",
  "logs",
  "apm",
  "dashboards",
  "monitors",
  "agents",
  "rum-synthetics",
  "tagging",
  "infrastructure",
  "service-catalog",
  "security",
];

const QUESTIONS_DIR = join(process.cwd(), "src", "data", "questions");

let totalValid = 0;
let totalInvalid = 0;
let totalDuplicates = 0;
const allErrors: string[] = [];
const seenIds = new Set<string>();

for (const domain of DOMAINS) {
  const filePath = join(QUESTIONS_DIR, `${domain}.json`);
  let raw: unknown[];
  try {
    raw = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (e) {
    allErrors.push(`[${domain}] Cannot read/parse file: ${e}`);
    continue;
  }

  if (!Array.isArray(raw)) {
    allErrors.push(`[${domain}] Root must be an array`);
    continue;
  }

  let domainValid = 0;
  let domainInvalid = 0;
  let domainDups = 0;

  for (const item of raw) {
    const id = (item as { id?: string })?.id ?? "(unknown)";
    const result = QuestionSchema.safeParse(item);

    if (!result.success) {
      domainInvalid++;
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      allErrors.push(`[${domain}] ${id}: ${issues}`);
      continue;
    }

    const q = result.data;

    // Check for duplicate IDs
    if (seenIds.has(q.id)) {
      domainDups++;
      allErrors.push(`[${domain}] Duplicate ID: ${q.id}`);
      continue;
    }
    seenIds.add(q.id);

    // Validate correct answer references
    const choiceIds = new Set(q.choices.map((c) => c.id));
    const correctIds = Array.isArray(q.correct) ? q.correct : [q.correct];
    for (const cid of correctIds) {
      if (!choiceIds.has(cid)) {
        domainInvalid++;
        allErrors.push(`[${domain}] ${q.id}: correct answer "${cid}" not found in choices`);
        continue;
      }
    }

    // Type-specific validation
    if (q.type === "true_false" && q.choices.length !== 2) {
      allErrors.push(`[${domain}] ${q.id}: true_false must have exactly 2 choices`);
      domainInvalid++;
      continue;
    }
    if (q.type === "multi_choice" && !Array.isArray(q.correct)) {
      allErrors.push(`[${domain}] ${q.id}: multi_choice correct must be an array`);
      domainInvalid++;
      continue;
    }
    if ((q.type === "single_choice" || q.type === "true_false") && Array.isArray(q.correct)) {
      allErrors.push(`[${domain}] ${q.id}: single_choice/true_false correct must be a string`);
      domainInvalid++;
      continue;
    }

    domainValid++;
  }

  totalValid += domainValid;
  totalInvalid += domainInvalid;
  totalDuplicates += domainDups;

  const status = domainInvalid + domainDups === 0 ? "✓" : "✗";
  console.log(`${status} ${domain}: ${domainValid} valid, ${domainInvalid} invalid, ${domainDups} duplicates`);
}

console.log("\n─────────────────────────────────");
console.log(`Total valid:      ${totalValid}`);
console.log(`Total invalid:    ${totalInvalid}`);
console.log(`Total duplicates: ${totalDuplicates}`);
console.log(`Total unique IDs: ${seenIds.size}`);

if (allErrors.length > 0) {
  console.log("\nErrors:");
  for (const e of allErrors) {
    console.error(`  ${e}`);
  }
  process.exit(1);
} else {
  console.log("\nAll questions valid!");
  process.exit(0);
}
