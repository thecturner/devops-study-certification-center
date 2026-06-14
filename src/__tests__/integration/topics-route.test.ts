import { GET } from "@/app/api/topics/route";
import { NextRequest } from "next/server";

function makeRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /api/topics", () => {
  it("returns datadog-fundamentals taxonomy when no cert param is given", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics"));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("topics");
    expect(Array.isArray(data.topics)).toBe(true);
    expect(data.topics.length).toBeGreaterThan(0);
    // Datadog topics should include monitoring concepts, not ServiceNow concepts
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds.some((id) => id.includes("platform") || id.includes("monitor") || id.includes("metric") || id.includes("log"))).toBe(true);
    expect(topicIds.some((id) => id.includes("platform-overview") || id.includes("incident"))).toBe(false);
  });

  it("returns datadog-fundamentals taxonomy for ?cert=datadog-fundamentals", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=datadog-fundamentals"));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.topics.length).toBeGreaterThan(0);
    // Datadog topics do not include servicenow-specific domains
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).not.toContain("platform-overview");
    expect(topicIds).not.toContain("user-administration");
  });

  it("returns servicenow-csa taxonomy for ?cert=servicenow-csa", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=servicenow-csa"));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.topics.length).toBeGreaterThan(0);
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("platform-overview");
    expect(topicIds).toContain("user-administration");
    expect(topicIds).toContain("itsm-fundamentals");
  });

  it("returns servicenow-cis-itsm taxonomy for ?cert=servicenow-cis-itsm", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=servicenow-cis-itsm"));
    expect(res.status).toBe(200);

    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("incident-management");
    expect(topicIds).toContain("change-management");
  });

  it("returns servicenow-cad taxonomy for ?cert=servicenow-cad", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=servicenow-cad"));
    expect(res.status).toBe(200);

    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("platform-scripting");
    expect(topicIds).toContain("api-integration");
  });

  it("returns k8s-cka taxonomy for ?cert=k8s-cka", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=k8s-cka"));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.topics.length).toBeGreaterThan(0);
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("storage");
    expect(topicIds).toContain("troubleshooting");
    expect(topicIds).toContain("workloads-scheduling");
  });

  it("returns k8s-ckad taxonomy for ?cert=k8s-ckad", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=k8s-ckad"));
    expect(res.status).toBe(200);

    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("application-design-build");
    expect(topicIds).toContain("application-deployment");
    expect(topicIds).toContain("app-env-config-security");
  });

  it("returns k8s-cks taxonomy for ?cert=k8s-cks", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=k8s-cks"));
    expect(res.status).toBe(200);

    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("cluster-setup");
    expect(topicIds).toContain("supply-chain-security");
    expect(topicIds).toContain("runtime-security");
  });

  it("returns aws-saa taxonomy for ?cert=aws-saa", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=aws-saa"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("secure-architectures");
    expect(topicIds).toContain("resilient-architectures");
    expect(topicIds).toContain("cost-optimized-architectures");
  });

  it("returns aws-sap taxonomy for ?cert=aws-sap", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=aws-sap"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("organizational-complexity");
    expect(topicIds).toContain("new-solutions-design");
    expect(topicIds).toContain("migration-modernization");
  });

  it("returns aws-dop taxonomy for ?cert=aws-dop", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=aws-dop"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("sdlc-automation");
    expect(topicIds).toContain("monitoring-logging");
    expect(topicIds).toContain("security-compliance");
  });

  it("returns gcp-ace taxonomy for ?cert=gcp-ace", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=gcp-ace"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("cloud-solution-environment");
    expect(topicIds).toContain("deploying-implementing");
    expect(topicIds).toContain("access-security");
  });

  it("returns gcp-pca taxonomy for ?cert=gcp-pca", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=gcp-pca"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("solution-design");
    expect(topicIds).toContain("security-compliance");
    expect(topicIds).toContain("reliability-operations");
  });

  it("returns gcp-pde taxonomy for ?cert=gcp-pde", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=gcp-pde"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("data-processing-systems");
    expect(topicIds).toContain("ml-models");
    expect(topicIds).toContain("solution-quality");
  });

  it("returns azure-az900 taxonomy for ?cert=azure-az900", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=azure-az900"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("cloud-concepts");
    expect(topicIds).toContain("azure-architecture");
    expect(topicIds).toContain("pricing-support");
  });

  it("returns azure-az104 taxonomy for ?cert=azure-az104", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=azure-az104"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("identity-governance");
    expect(topicIds).toContain("networking");
    expect(topicIds).toContain("monitoring-backup");
  });

  it("returns azure-az305 taxonomy for ?cert=azure-az305", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=azure-az305"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("identity-access");
    expect(topicIds).toContain("data-storage");
    expect(topicIds).toContain("business-continuity");
  });

  it("returns itil4-foundation taxonomy for ?cert=itil4-foundation", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=itil4-foundation"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("key-concepts");
    expect(topicIds).toContain("guiding-principles");
    expect(topicIds).toContain("practices");
  });

  it("returns itil4-mp taxonomy for ?cert=itil4-mp", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=itil4-mp"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("create-deliver-support");
    expect(topicIds).toContain("drive-stakeholder-value");
    expect(topicIds).toContain("high-velocity-it");
  });

  it("returns itil4-sl taxonomy for ?cert=itil4-sl", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=itil4-sl"));
    expect(res.status).toBe(200);
    const data = await res.json();
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).toContain("digital-strategy");
    expect(topicIds).toContain("governance-risk");
    expect(topicIds).toContain("leading-change");
  });

  it("falls back to datadog-fundamentals for an unknown cert param", async () => {
    const res = await GET(makeRequest("http://localhost/api/topics?cert=unknown-cert"));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.topics.length).toBeGreaterThan(0);
    // Should not have ServiceNow-specific topics
    const topicIds: string[] = data.topics.map((t: { id: string }) => t.id);
    expect(topicIds).not.toContain("platform-overview");
    expect(topicIds).not.toContain("incident-management");
  });

  it("returns distinct topic sets for datadog vs servicenow-csa", async () => {
    const [ddRes, snRes] = await Promise.all([
      GET(makeRequest("http://localhost/api/topics?cert=datadog-fundamentals")),
      GET(makeRequest("http://localhost/api/topics?cert=servicenow-csa")),
    ]);

    const ddTopics = (await ddRes.json()).topics.map((t: { id: string }) => t.id);
    const snTopics = (await snRes.json()).topics.map((t: { id: string }) => t.id);

    // No overlap expected between vendor topic sets
    const overlap = ddTopics.filter((id: string) => snTopics.includes(id));
    expect(overlap).toHaveLength(0);
  });
});
