import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GCP_CERTS } from "@/data/certifications/registry";

const QUESTION_COUNTS: Record<string, number> = {
  "gcp-ace": 75,
  "gcp-pca": 75,
  "gcp-pde": 75,
};

const DOMAIN_COUNTS: Record<string, number> = {
  "gcp-ace": 5,
  "gcp-pca": 5,
  "gcp-pde": 5,
};

export default function GCPPage() {
  return (
    <div className="app-surface vendor-gcp">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2">
          <Link href="/" className="brand-muted text-sm hover:text-foreground">
            Home
          </Link>
          <span className="brand-muted text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Google Cloud</span>
        </div>

        <div className="mt-6 mb-10 flex items-center gap-4">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-gcp-blue shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <span className="text-xs font-bold text-white">GCP</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Google Cloud Certifications</h1>
            <p className="brand-muted mt-1 text-sm">Choose a certification track to begin.</p>
          </div>
        </div>

        <div className="grid gap-5">
          {GCP_CERTS.map((cert) => (
            <Link
              key={cert.id}
              href={`/configure?cert=${cert.id}`}
              className="group block"
            >
              <Card className="transition-all hover:border-gcp-blue/40 hover:shadow-[0_4px_24px_rgba(66,133,244,0.10)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{cert.name}</h2>
                      <p className="brand-muted mt-1 text-sm">{cert.description}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {QUESTION_COUNTS[cert.id]} questions · {DOMAIN_COUNTS[cert.id]} domains
                      </p>
                    </div>
                    <p className="mt-1 shrink-0 text-sm font-semibold text-gcp-blue group-hover:underline">
                      Study &rarr;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
