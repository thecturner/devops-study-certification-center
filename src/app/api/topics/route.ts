import { NextRequest, NextResponse } from "next/server";
import type { CertificationId } from "@/types/quiz";

const CERT_IDS: CertificationId[] = [
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
];

async function loadTaxonomy(certId: CertificationId) {
  switch (certId) {
    case "datadog-fundamentals":
      return (await import("@/data/taxonomy.json")).default;
    case "servicenow-csa":
      return (await import("@/data/certifications/servicenow-csa/taxonomy.json")).default;
    case "servicenow-cis-itsm":
      return (await import("@/data/certifications/servicenow-cis-itsm/taxonomy.json")).default;
    case "servicenow-cad":
      return (await import("@/data/certifications/servicenow-cad/taxonomy.json")).default;
    case "k8s-cka":
      return (await import("@/data/certifications/k8s-cka/taxonomy.json")).default;
    case "k8s-ckad":
      return (await import("@/data/certifications/k8s-ckad/taxonomy.json")).default;
    case "k8s-cks":
      return (await import("@/data/certifications/k8s-cks/taxonomy.json")).default;
    case "aws-saa":
      return (await import("@/data/certifications/aws-saa/taxonomy.json")).default;
    case "aws-sap":
      return (await import("@/data/certifications/aws-sap/taxonomy.json")).default;
    case "aws-dop":
      return (await import("@/data/certifications/aws-dop/taxonomy.json")).default;
    case "gcp-ace":
      return (await import("@/data/certifications/gcp-ace/taxonomy.json")).default;
    case "gcp-pca":
      return (await import("@/data/certifications/gcp-pca/taxonomy.json")).default;
    case "gcp-pde":
      return (await import("@/data/certifications/gcp-pde/taxonomy.json")).default;
    case "azure-az900":
      return (await import("@/data/certifications/azure-az900/taxonomy.json")).default;
    case "azure-az104":
      return (await import("@/data/certifications/azure-az104/taxonomy.json")).default;
    case "azure-az305":
      return (await import("@/data/certifications/azure-az305/taxonomy.json")).default;
    case "itil4-foundation":
      return (await import("@/data/certifications/itil4-foundation/taxonomy.json")).default;
    case "itil4-mp":
      return (await import("@/data/certifications/itil4-mp/taxonomy.json")).default;
    case "itil4-sl":
      return (await import("@/data/certifications/itil4-sl/taxonomy.json")).default;
  }
}

export async function GET(req: NextRequest) {
  const certParam = req.nextUrl.searchParams.get("cert") ?? "datadog-fundamentals";
  const certId = CERT_IDS.includes(certParam as CertificationId)
    ? (certParam as CertificationId)
    : "datadog-fundamentals";

  const taxonomy = await loadTaxonomy(certId);
  return NextResponse.json(taxonomy);
}
