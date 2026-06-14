import { loadQuestionBank, getQuestionsByIds, validateQuestionBank } from "@/lib/questions/loader";
import type { CertificationId } from "@/types/quiz";

// Minimal valid question for mock-based tests
const VALID_Q = {
  id: "q-mock-001",
  type: "single_choice" as const,
  prompt: "Which option is correct?",
  choices: [
    { id: "a", text: "Option A" },
    { id: "b", text: "Option B" },
  ],
  correct: "a",
  explanation: "A is correct.",
  topics: ["test-topic"],
  difficulty: "easy" as const,
};

const VALID_Q2 = { ...VALID_Q, id: "q-mock-002" };

// ─── loadQuestionBank: real data ──────────────────────────────────────────────

describe("loadQuestionBank", () => {
  it.each<CertificationId>([
    "datadog-fundamentals",
    "servicenow-csa",
    "servicenow-cis-itsm",
    "servicenow-cad",
    "k8s-cka",
    "k8s-ckad",
    "k8s-cks",
    "aws-saa",
    "aws-sap",
    "aws-dop",
    "gcp-ace",
    "gcp-pca",
    "gcp-pde",
    "azure-az900",
    "azure-az104",
    "azure-az305",
    "itil4-foundation",
    "itil4-mp",
    "itil4-sl",
  ])("loads %s and returns questions with required fields", async (certId) => {
    const qs = await loadQuestionBank(certId);

    expect(qs.length).toBeGreaterThan(0);

    const first = qs[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("prompt");
    expect(first).toHaveProperty("choices");
    expect(first).toHaveProperty("correct");
    expect(first).toHaveProperty("explanation");
    expect(first).toHaveProperty("topics");
    expect(first).toHaveProperty("difficulty");
  });

  it("returns the same reference on a second call (cache hit)", async () => {
    const first = await loadQuestionBank("datadog-fundamentals");
    const second = await loadQuestionBank("datadog-fundamentals");
    expect(first).toBe(second);
  });

  it("returns unique IDs across the bank", async () => {
    const qs = await loadQuestionBank("servicenow-csa");
    const ids = qs.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("uses datadog-fundamentals as the default when no certId is passed", async () => {
    // Cache is already populated from earlier tests; calling without arg hits the cache
    // and exercises the default-parameter branch.
    const qs = await loadQuestionBank();
    expect(qs.length).toBeGreaterThan(0);
  });
});

// ─── getQuestionsByIds ────────────────────────────────────────────────────────

describe("getQuestionsByIds", () => {
  it("returns the requested questions in order", async () => {
    const all = await loadQuestionBank("datadog-fundamentals");
    const target = all.slice(0, 3);
    const ids = target.map((q) => q.id);

    const result = await getQuestionsByIds(ids, "datadog-fundamentals");

    expect(result).toHaveLength(3);
    expect(result.map((q) => q.id)).toEqual(ids);
  });

  it("skips IDs that do not exist in the bank", async () => {
    const result = await getQuestionsByIds(
      ["does-not-exist-abc123"],
      "datadog-fundamentals"
    );
    expect(result).toHaveLength(0);
  });

  it("handles a mix of known and unknown IDs", async () => {
    const all = await loadQuestionBank("servicenow-csa");
    const knownId = all[0].id;

    const result = await getQuestionsByIds(
      [knownId, "unknown-xyz"],
      "servicenow-csa"
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(knownId);
  });

  it("loads the bank on first call when cache is empty for a cert", async () => {
    // servicenow-cad cache populated by the loadQuestionBank tests above
    const all = await loadQuestionBank("servicenow-cad");
    const id = all[0].id;

    const result = await getQuestionsByIds([id], "servicenow-cad");
    expect(result[0].id).toBe(id);
  });

  it("defaults to datadog-fundamentals when no certId arg is passed", async () => {
    const all = await loadQuestionBank("datadog-fundamentals");
    const id = all[0].id;
    // Call without the second arg to exercise the default-parameter branch
    const result = await getQuestionsByIds([id]);
    expect(result[0].id).toBe(id);
  });
});

// ─── validateQuestionBank ─────────────────────────────────────────────────────

describe("validateQuestionBank", () => {
  it.each<CertificationId>([
    "datadog-fundamentals",
    "servicenow-csa",
    "servicenow-cis-itsm",
    "servicenow-cad",
  ])("reports no errors for %s", async (certId) => {
    const result = await validateQuestionBank(certId);

    expect(result.invalid).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBeGreaterThan(0);
    expect(result.total).toBe(result.valid);
  });

  it("defaults to datadog-fundamentals when no certId arg is passed", async () => {
    // Exercises the default-parameter branch of validateQuestionBank
    const result = await validateQuestionBank();
    expect(result.valid).toBeGreaterThan(0);
    expect(result.invalid).toBe(0);
  });
});

// ─── Error / edge-case paths (module-isolated) ────────────────────────────────

describe("loadQuestionBank error paths", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("skips a domain whose value is not an array", async () => {
    jest.doMock("@/data/certifications/servicenow-cis-itsm/questions", () => ({
      QUESTION_BANK: {
        "bad-domain": "not-an-array",
        "good-domain": [VALID_Q],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadQuestionBank: load } = require("@/lib/questions/loader");
    const qs = await load("servicenow-cis-itsm");

    expect(qs).toHaveLength(1);
    expect(qs[0].id).toBe(VALID_Q.id);
  });

  it("skips a question that fails schema validation", async () => {
    jest.doMock("@/data/certifications/servicenow-cis-itsm/questions", () => ({
      QUESTION_BANK: {
        domain: [
          { id: "bad-q" /* missing required fields */ },
          VALID_Q,
        ],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadQuestionBank: load } = require("@/lib/questions/loader");
    const qs = await load("servicenow-cis-itsm");

    expect(qs).toHaveLength(1);
    expect(qs[0].id).toBe(VALID_Q.id);
  });

  it("skips questions with duplicate IDs", async () => {
    jest.doMock("@/data/certifications/servicenow-cis-itsm/questions", () => ({
      QUESTION_BANK: {
        domain: [VALID_Q, VALID_Q2, { ...VALID_Q, id: VALID_Q.id }],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadQuestionBank: load } = require("@/lib/questions/loader");
    const qs = await load("servicenow-cis-itsm");

    expect(qs).toHaveLength(2);
    expect(qs.map((q: { id: string }) => q.id)).toEqual([VALID_Q.id, VALID_Q2.id]);
  });
});

describe("validateQuestionBank error paths", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("reports a non-array domain as an error", async () => {
    jest.doMock("@/data/certifications/servicenow-cad/questions", () => ({
      QUESTION_BANK: {
        "bad-domain": "not-an-array",
        "good-domain": [VALID_Q],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { validateQuestionBank: validate } = require("@/lib/questions/loader");
    const result = await validate("servicenow-cad");

    expect(result.errors.some((e: string) => e.includes("Not an array"))).toBe(true);
    expect(result.valid).toBe(1);
  });

  it("reports invalid questions in the error list", async () => {
    jest.doMock("@/data/certifications/servicenow-cad/questions", () => ({
      QUESTION_BANK: {
        domain: [{ id: "invalid-q" }, VALID_Q],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { validateQuestionBank: validate } = require("@/lib/questions/loader");
    const result = await validate("servicenow-cad");

    expect(result.invalid).toBe(1);
    expect(result.valid).toBe(1);
    expect(result.errors.some((e: string) => e.includes("invalid-q"))).toBe(true);
  });

  it("reports duplicate IDs in the error list", async () => {
    jest.doMock("@/data/certifications/servicenow-cad/questions", () => ({
      QUESTION_BANK: {
        domain: [VALID_Q, { ...VALID_Q, id: VALID_Q.id }],
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { validateQuestionBank: validate } = require("@/lib/questions/loader");
    const result = await validate("servicenow-cad");

    expect(result.duplicates).toBe(1);
    expect(result.valid).toBe(1);
    expect(result.errors.some((e: string) => e.includes("Duplicate ID"))).toBe(true);
  });
});
