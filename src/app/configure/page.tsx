import { QuizConfigForm } from "@/components/quiz/QuizConfigForm";
import { BrandLockup } from "@/components/BrandLockup";
import { getCertification } from "@/data/certifications/registry";
import { loadQuestionBank } from "@/lib/questions/loader";
import type { CertificationId } from "@/types/quiz";

const VALID_CERT_IDS: CertificationId[] = [
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
];

interface Props {
  searchParams: Promise<{ cert?: string }>;
}

export default async function ConfigurePage({ searchParams }: Props) {
  const params = await searchParams;
  const certParam = params.cert ?? "datadog-fundamentals";
  const certId: CertificationId = VALID_CERT_IDS.includes(certParam as CertificationId)
    ? (certParam as CertificationId)
    : "datadog-fundamentals";

  const cert = getCertification(certId);
  const certName = cert?.name ?? "Datadog Fundamentals";

  const questions = await loadQuestionBank(certId);
  const maxQuestions = questions.length;

  return (
    <div className="app-surface px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 rounded-3xl border border-border/70 bg-card/88 px-6 py-6 shadow-[0_18px_56px_rgba(7,25,63,0.08)] backdrop-blur">
          <BrandLockup className="mb-5" certId={certId} />
          <p className="brand-kicker">Quiz Builder</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{certName}</h1>
          <p className="brand-muted mt-2">
            Choose a question count and let the app build a balanced quiz mix, or switch to
            custom filters for targeted practice.
          </p>
        </div>
        <QuizConfigForm certId={certId} maxQuestions={maxQuestions} />
      </div>
    </div>
  );
}
