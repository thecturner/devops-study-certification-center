import { NextRequest } from "next/server";
import { POST } from "@/app/api/quiz/generate/route";

function makeJsonRequest(body: string) {
  return new NextRequest("http://localhost/api/quiz/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/quiz/generate", () => {
  it("returns 400 for invalid JSON", async () => {
    const res = await POST(makeJsonRequest("{"));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("returns 422 for invalid config", async () => {
    const res = await POST(makeJsonRequest(JSON.stringify({ count: 0 })));
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toBe("Invalid config");
  });

  it("returns 404 when no questions match the filters", async () => {
    const res = await POST(
      makeJsonRequest(
        JSON.stringify({
          count: 5,
          topics: ["topic-that-does-not-exist-xyz"],
          difficulty: "all",
          types: [],
          balanced: false,
          learningMode: false,
        })
      )
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("No questions match");
  });

  it("returns generated client-safe questions", async () => {
    const res = await POST(
      makeJsonRequest(
        JSON.stringify({
          count: 2,
          topics: [],
          difficulty: "all",
          types: [],
          balanced: true,
          learningMode: false,
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(typeof data.sessionId).toBe("string");
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBe(2);
    expect(data.questions[0]).not.toHaveProperty("correct");
    expect(data.questions[0]).not.toHaveProperty("explanation");
  });
});
