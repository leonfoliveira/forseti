import { ApiClient } from "./api";

export class Actor {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly contestId: string
  ) {}

  async signIn(login: string, password: string) {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contestId}/sign-in`,
      {
        method: "POST",
        body: JSON.stringify({
          login: login,
          password: password,
        }),
      }
    );
    const cookies = response.headers.get("set-cookie") as string;
    const sessionId = (/session_id=([^;]+)/.exec(cookies) as any)[1] as string;
    this.apiClient.sessionId = sessionId;
  }

  async uploadAttachment(file: File, context: string) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.apiClient.request(
      `/v1/contests/${this.contestId}/attachments/${context}`,
      {
        method: "POST",
        body: formData,
      },
      true
    );
    const data = (await response.json()) as { id: string };
    return data.id;
  }

  async createSubmission(
    problemId: string,
    language: string,
    attachmentId: string
  ) {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contestId}/submissions`,
      {
        method: "POST",
        body: JSON.stringify({
          problemId: problemId,
          language: language,
          code: { id: attachmentId },
        }),
      }
    );
    const data = (await response.json()) as { id: string };
    return data.id;
  }

  async findAllSubmissionsForMember() {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contestId}/submissions/full/members/me`,
      {
        method: "GET",
      }
    );
    const data = (await response.json()) as {
      id: string;
      status: string;
      answer: string;
    }[];
    return data;
  }
}
