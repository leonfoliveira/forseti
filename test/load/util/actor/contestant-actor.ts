import { ApiClient } from "../api-client";
import { AttachmentContext } from "../types";
import { Actor } from "./actor";

export class ContestantActor extends Actor {
  constructor(apiClient: ApiClient) {
    super(apiClient);
  }

  async createSubmission(
    contestId: string,
    problemId: string,
    language: string,
    code: File,
  ): Promise<string> {
    const attachmentId = await this.uploadAttachment(
      contestId,
      code,
      AttachmentContext.SUBMISSION_CODE,
    );

    const response = await this.apiClient.request(
      `/v1/contests/${contestId}/submissions`,
      {
        method: "POST",
        data: {
          problemId: problemId,
          language: language,
          code: { id: attachmentId },
        },
      },
    );
    return response.data.id;
  }
}
