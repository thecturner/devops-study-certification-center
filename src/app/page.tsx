import Link from "next/link";
import Image from "next/image";
import { InProgressQuizCard } from "@/components/quiz/InProgressQuizCard";

export default function HomePage() {
  return (
    <div className="app-surface">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Certification Study Center
          </h1>
          <p className="brand-muted mx-auto mt-4 max-w-xl text-lg">
            Prepare for certification exams across platforms with validated exam-style questions.
          </p>
        </div>

        <InProgressQuizCard />

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Datadog */}
          <Link
            href="/configure?cert=datadog-fundamentals"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-dd-purple/40 hover:shadow-[0_8px_32px_rgba(99,44,166,0.12)] focus:outline-none focus:ring-2 focus:ring-dd-purple/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <Image
                src="/brand/datadog-icon.svg"
                alt="Datadog"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-xl font-bold text-foreground">Datadog</h2>
            <p className="brand-muted mt-1 text-sm font-medium">Fundamentals</p>
            <p className="brand-muted mt-3 text-sm">
              Metrics, logs, APM, dashboards, monitors, RUM, Synthetics, and more.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>544 questions</span>
              <span aria-hidden>·</span>
              <span>11 domains</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-dd-purple group-hover:underline">
              Start studying &rarr;
            </p>
          </Link>

          {/* ServiceNow */}
          <Link
            href="/servicenow"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-sn-green/40 hover:shadow-[0_8px_32px_rgba(116,192,80,0.12)] focus:outline-none focus:ring-2 focus:ring-sn-green/50"
          >
            <div className="mb-6 flex h-14 w-28 items-center justify-center rounded-xl bg-white px-3 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <Image
                src="/brand/servicenow-logo.svg"
                alt="ServiceNow"
                width={90}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-xl font-bold text-foreground">ServiceNow</h2>
            <p className="brand-muted mt-1 text-sm font-medium">CSA · CIS-ITSM · CAD</p>
            <p className="brand-muted mt-3 text-sm">
              Platform administration, ITSM, application development, scripting, and APIs.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>18 domains</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-sn-green group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>

          {/* Kubernetes */}
          <Link
            href="/kubernetes"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-k8s-blue/40 hover:shadow-[0_8px_32px_rgba(50,108,229,0.12)] focus:outline-none focus:ring-2 focus:ring-k8s-blue/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-k8s-blue shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">K8s</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Kubernetes</h2>
            <p className="brand-muted mt-1 text-sm font-medium">CKA · CKAD · CKS</p>
            <p className="brand-muted mt-3 text-sm">
              Cluster administration, application development, and security hardening.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>240 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-k8s-blue group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>

          {/* AWS */}
          <Link
            href="/aws"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-aws-orange/40 hover:shadow-[0_8px_32px_rgba(255,153,0,0.12)] focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-aws-orange shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">AWS</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">AWS</h2>
            <p className="brand-muted mt-1 text-sm font-medium">SAA · SAP · DOP</p>
            <p className="brand-muted mt-3 text-sm">
              Cloud architecture, migrations, and DevOps engineering on Amazon Web Services.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>210 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-aws-orange group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>

          {/* GCP */}
          <Link
            href="/gcp"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-gcp-blue/40 hover:shadow-[0_8px_32px_rgba(66,133,244,0.12)] focus:outline-none focus:ring-2 focus:ring-gcp-blue/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-gcp-blue shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">GCP</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Google Cloud</h2>
            <p className="brand-muted mt-1 text-sm font-medium">ACE · PCA · PDE</p>
            <p className="brand-muted mt-3 text-sm">
              Cloud engineering, architecture, and data engineering on Google Cloud Platform.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>225 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-gcp-blue group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>

          {/* Azure */}
          <Link
            href="/azure"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-azure-blue/40 hover:shadow-[0_8px_32px_rgba(0,120,212,0.12)] focus:outline-none focus:ring-2 focus:ring-azure-blue/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-azure-blue shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">Azure</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Azure</h2>
            <p className="brand-muted mt-1 text-sm font-medium">AZ-900 · AZ-104 · AZ-305</p>
            <p className="brand-muted mt-3 text-sm">
              Cloud fundamentals, administration, and solutions architecture on Microsoft Azure.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>195 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-azure-blue group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>

          {/* ITIL */}
          <Link
            href="/itil"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-itil-purple/40 hover:shadow-[0_8px_32px_rgba(124,58,237,0.12)] focus:outline-none focus:ring-2 focus:ring-itil-purple/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-itil-purple shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">ITIL</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">ITIL 4</h2>
            <p className="brand-muted mt-1 text-sm font-medium">Foundation · MP · SL</p>
            <p className="brand-muted mt-3 text-sm">
              IT service management, value streams, and organizational strategy across three tracks.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>3 certifications</span>
              <span aria-hidden>·</span>
              <span>195 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-itil-purple group-hover:underline">
              Choose a track &rarr;
            </p>
          </Link>
          {/* Anthropic */}
          <Link
            href="/configure?cert=ccaf"
            className="group flex flex-col rounded-3xl border border-border/70 bg-card/88 p-8 shadow-[0_4px_24px_rgba(7,25,63,0.06)] backdrop-blur transition-all hover:border-anthropic-orange/40 hover:shadow-[0_8px_32px_rgba(217,119,87,0.12)] focus:outline-none focus:ring-2 focus:ring-anthropic-orange/50"
          >
            <div className="mb-6 flex h-14 w-20 items-center justify-center rounded-xl bg-anthropic-orange shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <span className="text-sm font-bold text-white">Claude</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Anthropic</h2>
            <p className="brand-muted mt-1 text-sm font-medium">CCAF</p>
            <p className="brand-muted mt-3 text-sm">
              Core Claude platform concepts: the Claude API, MCP, Claude Code, Subagents, Agent Skills, and Cowork.
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-muted-foreground">
              <span>1 certification</span>
              <span aria-hidden>·</span>
              <span>248 questions</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-anthropic-orange group-hover:underline">
              Start studying &rarr;
            </p>
          </Link>
        </div>

        <p className="brand-muted mt-10 text-center text-xs">
          No account required. Session data stays in your browser.
        </p>
      </div>
    </div>
  );
}
