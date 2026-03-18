import { ApiClient } from "../api-client";
import { AttachmentContext, AdminDashboard } from "../types";

export class Actor {
  constructor(protected readonly apiClient: ApiClient) {}

  async signIn(contestId: string, login: string, password: string) {
    const response = await this.apiClient.request(
      `/v1/contests/${contestId}:sign-in`,
      {
        method: "POST",
        data: { login, password },
      },
    );
    const cookies = response.headers["set-cookie"]!.join("; ");
    const sessionId = (/session_id=([^;]+)/.exec(cookies) as any)[1] as string;
    const csrfToken = (/csrf_token=([^;]+)/.exec(cookies) as any)[1] as string;
    this.apiClient.sessionId = sessionId;
    this.apiClient.csrfToken = csrfToken;
  }

  async getDashboard(contestId: string): Promise<AdminDashboard> {
    const response = await this.apiClient.request(
      `/v1/contests/${contestId}/dashboard/admin`,
      {
        method: "GET",
      },
    );
    return response.data;
  }

  async uploadAttachment(
    contestId: string,
    file: File,
    context: AttachmentContext,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    const uploadResponse = await this.apiClient.request(
      `/v1/contests/${contestId}/attachments`,
      {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return uploadResponse.data.id;
  }
}
