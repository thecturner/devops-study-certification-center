import { NextRequest } from "next/server";
import { POST as gradePOST } from "@/app/api/quiz/grade/route";
import { POST as feedbackPOST } from "@/app/api/quiz/feedback/route";
import { loadQuestionBank } from "@/lib/questions/loader";

function makeRequest(url: string, body: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/quiz/grade", () => {
  it("returns 400 for invalid JSON", async () => {
    const res = await gradePOST(makeRequest("http://localhost/api/quiz/grade", "{"));
    expect(res.status).toBe(400);
  });

  it("returns 422 for a malformed grade payload", async () => {
    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({ certificationId: "datadog-fundamentals", questionIds: "not-an-array" })
      )
    );
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBe("Invalid grade request");
  });

  it("grades a known correct answer for datadog-fundamentals", async () => {
    const [question] = await loadQuestionBank("datadog-fundamentals");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "datadog-fundamentals",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
    expect(data.pct).toBe(100);
    expect(data.passed).toBe(true);
  });

  it("defaults to datadog-fundamentals when certificationId is omitted", async () => {
    const [question] = await loadQuestionBank("datadog-fundamentals");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
  });

  it("grades a known correct answer for servicenow-csa", async () => {
    const [question] = await loadQuestionBank("servicenow-csa");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "servicenow-csa",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
    expect(data.pct).toBe(100);
    expect(data.passed).toBe(true);
  });

  it("grades a known correct answer for servicenow-cis-itsm", async () => {
    const [question] = await loadQuestionBank("servicenow-cis-itsm");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "servicenow-cis-itsm",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for servicenow-cad", async () => {
    const [question] = await loadQuestionBank("servicenow-cad");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "servicenow-cad",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for k8s-cka", async () => {
    const [question] = await loadQuestionBank("k8s-cka");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "k8s-cka",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
    expect(data.pct).toBe(100);
  });

  it("grades a known correct answer for k8s-ckad", async () => {
    const [question] = await loadQuestionBank("k8s-ckad");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "k8s-ckad",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for k8s-cks", async () => {
    const [question] = await loadQuestionBank("k8s-cks");
    const correctAnswer = Array.isArray(question.correct)
      ? [...question.correct]
      : question.correct;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "k8s-cks",
          questionIds: [question.id],
          answers: { [question.id]: correctAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalQuestions).toBe(1);
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for aws-saa", async () => {
    const [question] = await loadQuestionBank("aws-saa");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "aws-saa",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for aws-sap", async () => {
    const [question] = await loadQuestionBank("aws-sap");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "aws-sap",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for aws-dop", async () => {
    const [question] = await loadQuestionBank("aws-dop");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "aws-dop",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for gcp-ace", async () => {
    const [question] = await loadQuestionBank("gcp-ace");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "gcp-ace",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for gcp-pca", async () => {
    const [question] = await loadQuestionBank("gcp-pca");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "gcp-pca",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for gcp-pde", async () => {
    const [question] = await loadQuestionBank("gcp-pde");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "gcp-pde",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for azure-az900", async () => {
    const [question] = await loadQuestionBank("azure-az900");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "azure-az900",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for azure-az104", async () => {
    const [question] = await loadQuestionBank("azure-az104");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "azure-az104",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for azure-az305", async () => {
    const [question] = await loadQuestionBank("azure-az305");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "azure-az305",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for itil4-foundation", async () => {
    const [question] = await loadQuestionBank("itil4-foundation");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "itil4-foundation",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for itil4-mp", async () => {
    const [question] = await loadQuestionBank("itil4-mp");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "itil4-mp",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("grades a known correct answer for itil4-sl", async () => {
    const [question] = await loadQuestionBank("itil4-sl");
    const correctAnswer = Array.isArray(question.correct) ? [...question.correct] : question.correct;
    const res = await gradePOST(
      makeRequest("http://localhost/api/quiz/grade", JSON.stringify({
        certificationId: "itil4-sl",
        questionIds: [question.id],
        answers: { [question.id]: correctAnswer },
      }))
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(1);
  });

  it("returns 404 when a datadog question ID is graded against a servicenow cert", async () => {
    // This is the exact bug that was fixed: missing certificationId caused cross-bank lookup.
    // The grade route returns 404 when no matching questions are found in the specified cert bank.
    const [ddQuestion] = await loadQuestionBank("datadog-fundamentals");

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "servicenow-csa",
          questionIds: [ddQuestion.id],
          answers: { [ddQuestion.id]: ddQuestion.correct },
        })
      )
    );

    expect(res.status).toBe(404);
  });

  it("marks an incorrect answer as wrong for servicenow-csa", async () => {
    const [question] = await loadQuestionBank("servicenow-csa");
    // Provide a non-correct choice
    const wrongAnswer = question.choices.find(
      (c) =>
        Array.isArray(question.correct)
          ? !question.correct.includes(c.id)
          : c.id !== question.correct
    )!.id;

    const res = await gradePOST(
      makeRequest(
        "http://localhost/api/quiz/grade",
        JSON.stringify({
          certificationId: "servicenow-csa",
          questionIds: [question.id],
          answers: { [question.id]: wrongAnswer },
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalCorrect).toBe(0);
    expect(data.passed).toBe(false);
  });
});

describe("POST /api/quiz/feedback", () => {
  it("returns 422 for malformed payload", async () => {
    const res = await feedbackPOST(
      makeRequest(
        "http://localhost/api/quiz/feedback",
        JSON.stringify({ questionId: "", answer: null })
      )
    );
    expect(res.status).toBe(422);
  });

  it("returns immediate feedback for a datadog-fundamentals question", async () => {
    const [question] = await loadQuestionBank("datadog-fundamentals");
    const answer = Array.isArray(question.correct)
      ? question.correct[0] ?? null
      : question.correct;

    const res = await feedbackPOST(
      makeRequest(
        "http://localhost/api/quiz/feedback",
        JSON.stringify({
          certificationId: "datadog-fundamentals",
          questionId: question.id,
          answer,
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("result");
    expect(data.result.questionId).toBe(question.id);
    expect(typeof data.result.correct).toBe("boolean");
    expect(typeof data.result.shortExplanation).toBe("string");
  });

  it("returns immediate feedback for a servicenow-csa question", async () => {
    const [question] = await loadQuestionBank("servicenow-csa");
    const answer = Array.isArray(question.correct)
      ? question.correct[0] ?? null
      : question.correct;

    const res = await feedbackPOST(
      makeRequest(
        "http://localhost/api/quiz/feedback",
        JSON.stringify({
          certificationId: "servicenow-csa",
          questionId: question.id,
          answer,
        })
      )
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.questionId).toBe(question.id);
    expect(typeof data.result.correct).toBe("boolean");
  });

  it("returns 404 when a datadog question ID is looked up against a servicenow cert", async () => {
    // This is the exact bug that was fixed: missing certificationId caused wrong bank lookup
    const [ddQuestion] = await loadQuestionBank("datadog-fundamentals");

    const res = await feedbackPOST(
      makeRequest(
        "http://localhost/api/quiz/feedback",
        JSON.stringify({
          certificationId: "servicenow-csa",
          questionId: ddQuestion.id,
          answer: ddQuestion.correct,
        })
      )
    );

    expect(res.status).toBe(404);
  });

  it("defaults to datadog-fundamentals when certificationId is omitted", async () => {
    const [question] = await loadQuestionBank("datadog-fundamentals");
    const answer = Array.isArray(question.correct)
      ? question.correct[0] ?? null
      : question.correct;

    const res = await feedbackPOST(
      makeRequest(
        "http://localhost/api/quiz/feedback",
        JSON.stringify({ questionId: question.id, answer })
      )
    );

    expect(res.status).toBe(200);
  });
});
