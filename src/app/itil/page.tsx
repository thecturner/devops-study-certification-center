import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ITIL_CERTS } from "@/data/certifications/registry";

const CERT_META: Record<string, { questions: number; domains: number; level: string }> = {
  "itil4-foundation": { questions: 75, domains: 5, level: "Entry level" },
  "itil4-mp":         { questions: 60, domains: 4, level: "Intermediate" },
  "itil4-sl":         { questions: 60, domains: 4, level: "Advanced" },
};

const CERT_STYLE: Record<string, { badge: string; cta: string }> = {
  "itil4-foundation": {
    badge: "bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-700/50",
    cta:   "text-violet-700 dark:text-violet-300",
  },
  "itil4-mp": {
    badge: "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700/50",
    cta:   "text-purple-800 dark:text-purple-300",
  },
  "itil4-sl": {
    badge: "bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700/50",
    cta:   "text-indigo-700 dark:text-indigo-300",
  },
};

function ITILMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-label="ITIL 4"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left vertical bar */}
      <rect x="8" y="10" width="7" height="28" rx="3.5" fill="currentColor" />
      {/* Right vertical bar */}
      <rect x="33" y="10" width="7" height="28" rx="3.5" fill="currentColor" />
      {/* Top connecting arc */}
      <path d="M15 14 Q24 6 33 14" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {/* Bottom connecting arc */}
      <path d="M15 34 Q24 44 33 34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      {/* Center service-value-loop accent */}
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
    </svg>
  );
}

export default function ITILPage() {
  return (
    <div className="app-surface vendor-itil">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2">
          <Link href="/" className="brand-muted text-sm hover:text-foreground">
            Home
          </Link>
          <span className="brand-muted text-sm">/</span>
          <span className="text-sm font-medium text-foreground">ITIL 4</span>
        </div>

        <div className="mt-6 mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md dark:bg-white/8 dark:border dark:border-white/12">
            <ITILMark className="h-8 w-8 text-violet-600 dark:text-violet-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ITIL 4 Certifications</h1>
            <p className="brand-muted mt-1 text-sm">Choose a certification track to begin.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {ITIL_CERTS.map((cert) => {
            const meta = CERT_META[cert.id];
            const style = CERT_STYLE[cert.id];
            return (
              <Link
                key={cert.id}
                href={`/configure?cert=${cert.id}`}
                className="group block"
              >
                <Card className="transition-all hover:border-itil-purple/40 hover:shadow-[0_4px_24px_rgba(124,58,237,0.10)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className={`mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${style.badge}`}>
                          {cert.name.replace("ITIL 4 ", "")}
                        </span>
                        <h2 className="text-base font-bold text-foreground">{cert.name}</h2>
                        <p className="brand-muted mt-1 text-sm leading-relaxed">{cert.description}</p>
                        {meta && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {meta.level} · {meta.domains} domains · ~{meta.questions} questions
                          </p>
                        )}
                      </div>
                      <p className={`mt-1 shrink-0 text-sm font-semibold group-hover:underline ${style.cta}`}>
                        Study &rarr;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
