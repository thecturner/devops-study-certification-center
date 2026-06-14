import { z } from "zod";

export const ChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const RefSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().optional(),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["single_choice", "multi_choice", "true_false"]),
  prompt: z.string().min(1),
  choices: z.array(ChoiceSchema).min(2),
  correct: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().min(1),
  topics: z.array(z.string()).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  refs: z.array(RefSchema).optional(),
  version: z.number().int().positive().default(1),
});

const CertificationIdSchema = z.enum([
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
  "ccaf",
]);

export const QuizConfigSchema = z.object({
  certificationId: CertificationIdSchema.default("datadog-fundamentals"),
  count: z.number().int().min(1),
  topics: z.array(z.string()).default([]),
  difficulty: z.enum(["easy", "medium", "hard", "all"]).default("all"),
  types: z
    .array(z.enum(["single_choice", "multi_choice", "true_false"]))
    .default([]),
  timer: z.number().int().min(0).optional(),
  balanced: z.boolean().default(true),
  learningMode: z.boolean().default(false),
});

export const GradeRequestSchema = z.object({
  certificationId: CertificationIdSchema.default("datadog-fundamentals"),
  questionIds: z.array(z.string()).min(1),
  answers: z.record(
    z.string(),
    z.union([z.string(), z.array(z.string()), z.null()])
  ),
});

export const FeedbackRequestSchema = z.object({
  certificationId: CertificationIdSchema.default("datadog-fundamentals"),
  questionId: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string()), z.null()]),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;
export type QuizConfigInput = z.infer<typeof QuizConfigSchema>;
