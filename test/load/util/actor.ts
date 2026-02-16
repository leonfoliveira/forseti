import { randomUUID } from "node:crypto";
import { ApiClient } from "./api";

const problemDescription = new File(
  [new Blob(["description"])],
  "description.txt",
  {
    type: "application/pdf",
  },
);
const problemTestCases = new File(
  [new Blob([`1,2\n2,4\n3,6\n4,8\n5,10`])],
  "test-cases.csv",
  {
    type: "text/csv",
  },
);

export class Actor {
  constructor(private readonly apiClient: ApiClient) {}

  private contest = {} as { id: string };

  async signIn(password: string) {
    const response = await this.apiClient.request(`/v1/root:sign-in`, {
      method: "POST",
      body: JSON.stringify({
        password: password,
      }),
    });
    const cookies = response.headers.get("set-cookie") as string;
    const sessionId = (/session_id=([^;]+)/.exec(cookies) as any)[1] as string;
    this.apiClient.sessionId = sessionId;
  }

  async createContest() {
    const response = await this.apiClient.request(`/v1/contests`, {
      method: "POST",
      body: JSON.stringify({
        slug: randomUUID().substring(0, 32),
        title: "Test Contest",
        languages: ["CPP_17", "JAVA_21", "PYTHON_312"],
        startAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }),
    });
    const data = (await response.json()) as { id: string };
    this.contest = data;
    console.log("Created contest:", data.id);
    return data;
  }

  async createProblem() {
    const response = await this.apiClient.request(`/v1/contests`, {
      method: "PUT",
      body: JSON.stringify({
        ...this.contest,
        problems: [
          {
            letter: "A",
            color: "#ffffff",
            title: "Test Problem",
            description: {
              id: await this.uploadAttachment(
                problemDescription,
                "PROBLEM_DESCRIPTION",
              ),
            },
            timeLimit: 1000,
            memoryLimit: 1024,
            testCases: {
              id: await this.uploadAttachment(
                problemTestCases,
                "PROBLEM_TEST_CASES",
              ),
            },
          },
        ],
      }),
    });
    const data = (await response.json()) as { problems: { id: string }[] };
    return data.problems[0] as { id: string };
  }

  async forceStart() {
    await this.apiClient.request(`/v1/contests/${this.contest.id}/start`, {
      method: "PUT",
    });
  }

  async uploadAttachment(file: File, context: string) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.apiClient.request(
      `/v1/contests/${this.contest.id}/attachments/${context}`,
      {
        method: "POST",
        body: formData,
      },
      true,
    );
    const data = (await response.json()) as { id: string };
    return data.id;
  }

  async createSubmission(
    problemId: string,
    language: string,
    attachmentId: string,
  ) {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contest.id}/submissions`,
      {
        method: "POST",
        body: JSON.stringify({
          problemId: problemId,
          language: language,
          code: { id: attachmentId },
        }),
      },
    );
    const data = (await response.json()) as { id: string };
    return data.id;
  }

  async findAllSubmissionsForMember() {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contest.id}/submissions/full/members/me`,
      {
        method: "GET",
      },
    );
    const data = (await response.json()) as {
      id: string;
      status: string;
      answer: string;
      problem: { id: string };
    }[];
    return data;
  }
}
