import { TopicScore, QuestionResult, StudyGuide, WeakTopic, StudyPointer, StudyScenario } from "@/types/quiz";
import type { CertificationId } from "@/types/quiz";
import datadogTaxonomy from "@/data/taxonomy.json";

const MIN_ATTEMPTS = 2; // ignore topics with fewer attempts
const MAX_WEAK_TOPICS = 5;

interface TaxonomyTopic {
  id: string;
  label?: string;
  studyPointers?: StudyPointer[];
  examScenarios?: StudyScenario[];
}

async function loadTaxonomy(certId: CertificationId): Promise<{ topics: TaxonomyTopic[] }> {
  switch (certId) {
    case "servicenow-csa":
      return import("@/data/certifications/servicenow-csa/taxonomy.json");
    case "servicenow-cis-itsm":
      return import("@/data/certifications/servicenow-cis-itsm/taxonomy.json");
    case "servicenow-cad":
      return import("@/data/certifications/servicenow-cad/taxonomy.json");
    case "k8s-cka":
      return import("@/data/certifications/k8s-cka/taxonomy.json");
    case "k8s-ckad":
      return import("@/data/certifications/k8s-ckad/taxonomy.json");
    case "k8s-cks":
      return import("@/data/certifications/k8s-cks/taxonomy.json");
    case "aws-saa":
      return import("@/data/certifications/aws-saa/taxonomy.json");
    case "aws-sap":
      return import("@/data/certifications/aws-sap/taxonomy.json");
    case "aws-dop":
      return import("@/data/certifications/aws-dop/taxonomy.json");
    case "gcp-ace":
      return import("@/data/certifications/gcp-ace/taxonomy.json");
    case "gcp-pca":
      return import("@/data/certifications/gcp-pca/taxonomy.json");
    case "gcp-pde":
      return import("@/data/certifications/gcp-pde/taxonomy.json");
    case "azure-az900":
      return import("@/data/certifications/azure-az900/taxonomy.json");
    case "azure-az104":
      return import("@/data/certifications/azure-az104/taxonomy.json");
    case "azure-az305":
      return import("@/data/certifications/azure-az305/taxonomy.json");
    case "itil4-foundation":
      return import("@/data/certifications/itil4-foundation/taxonomy.json");
    case "itil4-mp":
      return import("@/data/certifications/itil4-mp/taxonomy.json");
    case "itil4-sl":
      return import("@/data/certifications/itil4-sl/taxonomy.json");
    default:
      return datadogTaxonomy;
  }
}

export async function generateStudyGuide(
  byTopic: TopicScore[],
  questionResults: QuestionResult[],
  certId: CertificationId = "datadog-fundamentals"
): Promise<StudyGuide> {
  const taxonomy = await loadTaxonomy(certId);
  const topicMap = new Map(taxonomy.topics.map((t) => [t.id, t]));

  // Compute weak topics: low pct, minimum attempts
  const weakTopics: WeakTopic[] = byTopic
    .filter((t) => t.attempted >= MIN_ATTEMPTS)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, MAX_WEAK_TOPICS)
    .filter((t) => t.pct < 80) // only surface genuinely weak areas
    .map((t) => {
      const taxEntry = topicMap.get(t.topicId);
      const missedQuestionIds = questionResults
        .filter((r) => !r.correct && r.topics.includes(t.topicId))
        .map((r) => r.questionId);

      return {
        topicId: t.topicId,
        label: taxEntry?.label ?? t.topicId,
        pct: t.pct,
        attempted: t.attempted,
        correct: t.correct,
        studyPointers: taxEntry?.studyPointers ?? [],
        examScenarios: taxEntry?.examScenarios ?? [],
        missedQuestionIds,
      };
    });

  // Generate next steps
  const nextSteps: string[] = [];
  if (weakTopics.length === 0) {
    nextSteps.push("Great job! Review any flagged questions and consider taking a harder quiz.");
  } else {
    nextSteps.push(
      `Focus on your weakest ${weakTopics.length === 1 ? "topic" : "topics"}: ${weakTopics.map((t) => t.label).join(", ")}.`
    );
    if (weakTopics.some((t) => t.pct < 50)) {
      nextSteps.push("Some topics scored below 50%. Revisit the official documentation links above.");
    }
    if (weakTopics.some((t) => t.examScenarios.length > 0)) {
      nextSteps.push("Work through the exam-style scenarios below to practice recognizing the same patterns in plain language.");
    }
    nextSteps.push("Use the 'Retry missed questions' option to practice only the questions you got wrong.");
    nextSteps.push("After studying, take a new focused quiz filtered to your weak topics.");
  }

  return { weakTopics, nextSteps };
}
