import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { SERVICENOW_CERTS } from "@/data/certifications/registry";

const TOPIC_COUNTS: Record<string, number> = {
  "servicenow-csa": 6,
  "servicenow-cis-itsm": 6,
  "servicenow-cad": 6,
};

const CERT_SUBTITLES: Record<string, string> = {
  "servicenow-csa": "Platform administration, user management, ITSM, reporting, and data.",
  "servicenow-cis-itsm": "Incident, problem, change, SLA, CMDB, and knowledge management.",
  "servicenow-cad": "Scripting, business rules, REST APIs, Glide, and app development.",
};

export default function ServiceNowPage() {
  return (
    <div className="app-surface vendor-servicenow">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2">
          <Link href="/" className="brand-muted text-sm hover:text-foreground">
            Home
          </Link>
          <span className="brand-muted text-sm">/</span>
          <span className="text-sm font-medium text-foreground">ServiceNow</span>
        </div>

        <div className="mt-6 mb-10 flex items-center gap-4">
          <div className="flex h-12 w-32 shrink-0 items-center justify-center rounded-xl bg-white px-3 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <Image
              src="/brand/servicenow-logo.svg"
              alt="ServiceNow"
              width={90}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ServiceNow Certifications</h1>
            <p className="brand-muted mt-1 text-sm">Choose a certification track to begin.</p>
          </div>
        </div>

        <div className="grid gap-5">
          {SERVICENOW_CERTS.map((cert) => (
            <Link
              key={cert.id}
              href={`/configure?cert=${cert.id}`}
              className="group block"
            >
              <Card className="transition-all hover:border-sn-green/40 hover:shadow-[0_4px_24px_rgba(116,192,80,0.10)] focus:outline-none">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{cert.name}</h2>
                      <p className="brand-muted mt-1 text-sm">
                        {CERT_SUBTITLES[cert.id] ?? cert.description}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {TOPIC_COUNTS[cert.id] ?? 6} topic domains
                      </p>
                    </div>
                    <p className="mt-1 shrink-0 text-sm font-semibold text-sn-green group-hover:underline">
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
