import type { Certification, CertificationId } from "@/types/quiz";

export const CERTIFICATIONS: Certification[] = [
  {
    id: "datadog-fundamentals",
    name: "Datadog Fundamentals",
    vendor: "datadog",
    description: "Core observability concepts across metrics, logs, APM, dashboards, and monitors.",
    color: "purple",
  },
  {
    id: "servicenow-csa",
    name: "Certified System Administrator",
    vendor: "servicenow",
    description: "Platform administration, user management, ITSM, reporting, and data management.",
    color: "green",
  },
  {
    id: "servicenow-cis-itsm",
    name: "CIS-ITSM: IT Service Management",
    vendor: "servicenow",
    description: "Advanced incident, problem, change, SLA, CMDB, and knowledge management.",
    color: "green",
  },
  {
    id: "servicenow-cad",
    name: "Certified Application Developer",
    vendor: "servicenow",
    description: "Platform scripting, business rules, REST APIs, Glide, and application development.",
    color: "green",
  },
  {
    id: "k8s-cka",
    name: "Certified Kubernetes Administrator",
    vendor: "kubernetes",
    description: "Cluster architecture, workloads, services, storage, and troubleshooting in production Kubernetes.",
    color: "blue",
  },
  {
    id: "k8s-ckad",
    name: "Certified Kubernetes Application Developer",
    vendor: "kubernetes",
    description: "Designing, building, and deploying cloud-native applications on Kubernetes.",
    color: "blue",
  },
  {
    id: "k8s-cks",
    name: "Certified Kubernetes Security Specialist",
    vendor: "kubernetes",
    description: "Securing Kubernetes clusters: hardening, supply chain, runtime security, and microservice vulnerabilities.",
    color: "indigo",
  },
  {
    id: "aws-saa",
    name: "Solutions Architect Associate",
    vendor: "aws",
    description: "Designing secure, resilient, high-performing, and cost-optimized architectures on AWS.",
    color: "orange",
  },
  {
    id: "aws-sap",
    name: "Solutions Architect Professional",
    vendor: "aws",
    description: "Advanced multi-account architectures, migrations, hybrid connectivity, and complex HA patterns on AWS.",
    color: "orange",
  },
  {
    id: "aws-dop",
    name: "DevOps Engineer Professional",
    vendor: "aws",
    description: "CI/CD automation, infrastructure as code, monitoring, incident response, and security on AWS.",
    color: "orange",
  },
  {
    id: "gcp-ace",
    name: "Associate Cloud Engineer",
    vendor: "gcp",
    description: "Deploying applications, monitoring operations, and managing enterprise solutions on Google Cloud.",
    color: "blue",
  },
  {
    id: "gcp-pca",
    name: "Professional Cloud Architect",
    vendor: "gcp",
    description: "Designing, developing, and managing robust, secure, scalable, highly available cloud architectures on GCP.",
    color: "red",
  },
  {
    id: "gcp-pde",
    name: "Professional Data Engineer",
    vendor: "gcp",
    description: "Designing and building data processing systems and creating machine learning models on Google Cloud.",
    color: "yellow",
  },
  {
    id: "azure-az900",
    name: "AZ-900: Azure Fundamentals",
    vendor: "azure",
    description: "Core cloud concepts, Azure services, pricing, SLAs, and the Azure management model.",
    color: "blue",
  },
  {
    id: "azure-az104",
    name: "AZ-104: Azure Administrator",
    vendor: "azure",
    description: "Managing Azure identities, governance, storage, compute, and virtual networks in production environments.",
    color: "blue",
  },
  {
    id: "azure-az305",
    name: "AZ-305: Azure Solutions Architect Expert",
    vendor: "azure",
    description: "Designing cloud and hybrid solutions including identity, networking, storage, business continuity, and data platform architectures on Azure.",
    color: "indigo",
  },
  {
    id: "itil4-foundation",
    name: "ITIL 4 Foundation",
    vendor: "itil",
    description: "Core concepts of IT service management: the Service Value System, four dimensions, service value chain, guiding principles, and key ITIL practices.",
    color: "purple",
  },
  {
    id: "itil4-mp",
    name: "ITIL 4 Managing Professional",
    vendor: "itil",
    description: "Advanced IT service management across four modules: Create Deliver and Support, Drive Stakeholder Value, High-velocity IT, and Direct Plan and Improve.",
    color: "purple",
  },
  {
    id: "itil4-sl",
    name: "ITIL 4 Strategic Leader",
    vendor: "itil",
    description: "Strategic application of ITIL 4 across the entire organization, covering digital strategy, governance, and organization-wide IT service direction.",
    color: "indigo",
  },
  {
    id: "ccaf",
    name: "Claude Certified Architect Foundations",
    vendor: "anthropic",
    description: "Core Claude platform concepts: Skills, the Anthropic API, Model Context Protocol, and Claude Code.",
    color: "orange",
  },
];

export function getCertification(id: CertificationId): Certification | undefined {
  return CERTIFICATIONS.find((c) => c.id === id);
}

export const ANTHROPIC_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "anthropic");
export const SERVICENOW_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "servicenow");
export const KUBERNETES_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "kubernetes");
export const AWS_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "aws");
export const GCP_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "gcp");
export const AZURE_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "azure");
export const ITIL_CERTS = CERTIFICATIONS.filter((c) => c.vendor === "itil");
