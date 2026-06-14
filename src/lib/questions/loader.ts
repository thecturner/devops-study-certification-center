import { Question } from "@/types/quiz";
import type { CertificationId } from "@/types/quiz";
import { QuestionSchema } from "./schema";

// Per-cert caches
const _caches = new Map<CertificationId, Question[]>();
const _byIds = new Map<CertificationId, Map<string, Question>>();

async function importBank(certId: CertificationId): Promise<Record<string, unknown[]>> {
  switch (certId) {
    case "datadog-fundamentals": {
      const mod = await import("@/data/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "servicenow-csa": {
      const mod = await import("@/data/certifications/servicenow-csa/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "servicenow-cis-itsm": {
      const mod = await import("@/data/certifications/servicenow-cis-itsm/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "servicenow-cad": {
      const mod = await import("@/data/certifications/servicenow-cad/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "k8s-cka": {
      const mod = await import("@/data/certifications/k8s-cka/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "k8s-ckad": {
      const mod = await import("@/data/certifications/k8s-ckad/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "k8s-cks": {
      const mod = await import("@/data/certifications/k8s-cks/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "aws-saa": {
      const mod = await import("@/data/certifications/aws-saa/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "aws-sap": {
      const mod = await import("@/data/certifications/aws-sap/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "aws-dop": {
      const mod = await import("@/data/certifications/aws-dop/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "gcp-ace": {
      const mod = await import("@/data/certifications/gcp-ace/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "gcp-pca": {
      const mod = await import("@/data/certifications/gcp-pca/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "gcp-pde": {
      const mod = await import("@/data/certifications/gcp-pde/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "azure-az900": {
      const mod = await import("@/data/certifications/azure-az900/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "azure-az104": {
      const mod = await import("@/data/certifications/azure-az104/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "azure-az305": {
      const mod = await import("@/data/certifications/azure-az305/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "itil4-foundation": {
      const mod = await import("@/data/certifications/itil4-foundation/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "itil4-mp": {
      const mod = await import("@/data/certifications/itil4-mp/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "itil4-sl": {
      const mod = await import("@/data/certifications/itil4-sl/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
    case "ccaf": {
      const mod = await import("@/data/certifications/ccaf/questions");
      return mod.QUESTION_BANK as Record<string, unknown[]>;
    }
  }
}

export async function loadQuestionBank(certId: CertificationId = "datadog-fundamentals"): Promise<Question[]> {
  const cached = _caches.get(certId);
  if (cached) return cached;

  const bank = await importBank(certId);
  const allQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const [domain, raw] of Object.entries(bank)) {
    if (!Array.isArray(raw)) {
      console.warn('[loader] Domain "%s" did not export an array; skipping.', domain);
      continue;
    }

    for (const item of raw) {
      const result = QuestionSchema.safeParse(item);
      if (!result.success) {
        console.warn(
          '[loader] Invalid question in "%s":',
          domain,
          (item as { id?: string })?.id ?? "(unknown)",
          result.error.flatten()
        );
        continue;
      }
      const q = result.data as Question;
      if (seenIds.has(q.id)) {
        console.warn('[loader] Duplicate question ID "%s" in domain "%s"; skipping.', q.id, domain);
        continue;
      }
      seenIds.add(q.id);
      allQuestions.push(q);
    }
  }

  _caches.set(certId, allQuestions);
  _byIds.set(certId, new Map(allQuestions.map((q) => [q.id, q])));

  console.log(
    "[loader] Loaded %d questions from %d domains for cert %s.",
    allQuestions.length,
    Object.keys(bank).length,
    certId
  );
  return allQuestions;
}

export async function getQuestionsByIds(
  ids: string[],
  certId: CertificationId = "datadog-fundamentals"
): Promise<Question[]> {
  if (!_byIds.has(certId)) await loadQuestionBank(certId);
  const byId = _byIds.get(certId)!;
  return ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [q] : [];
  });
}

/** Return validation summary, used by the validate script. */
export async function validateQuestionBank(certId: CertificationId = "datadog-fundamentals"): Promise<{
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  errors: string[];
}> {
  const bank = await importBank(certId);
  const errors: string[] = [];
  const seenIds = new Set<string>();
  let invalid = 0;
  let duplicates = 0;
  let valid = 0;

  for (const [domain, raw] of Object.entries(bank)) {
    if (!Array.isArray(raw)) {
      errors.push(`[${domain}] Not an array`);
      continue;
    }
    for (const item of raw) {
      const id = (item as { id?: string })?.id ?? "(unknown)";
      const result = QuestionSchema.safeParse(item);
      if (!result.success) {
        invalid++;
        const issues = result.error.issues
          .map((i: { message: string }) => i.message)
          .join("; ");
        errors.push(`[${domain}] ${id}: ${issues}`);
        continue;
      }
      if (seenIds.has(id)) {
        duplicates++;
        errors.push(`[${domain}] Duplicate ID: ${id}`);
        continue;
      }
      seenIds.add(id);
      valid++;
    }
  }

  return { total: valid + invalid + duplicates, valid, invalid, duplicates, errors };
}
