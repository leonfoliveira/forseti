import { randomUUID } from "node:crypto";
import { ApiClient } from "../api-client";
import { Actor } from "./actor";
import { AttachmentContext, Contest, MemberType } from "../types";
import { FileUtil } from "../file-util";

export class RootActor extends Actor {
  constructor(apiClient: ApiClient) {
    super(apiClient);
  }

  async signIn(password: string) {
    const response = await this.apiClient.request(`/v1/root:sign-in`, {
      method: "POST",
      data: { password },
    });
    const cookies = response.headers["set-cookie"]!.join("; ");
    const sessionId = (/session_id=([^;]+)/.exec(cookies) as any)[1] as string;
    const csrfToken = (/csrf_token=([^;]+)/.exec(cookies) as any)[1] as string;
    this.apiClient.sessionId = sessionId;
    this.apiClient.csrfToken = csrfToken;
  }

  async createContest(): Promise<Contest> {
    const response = await this.apiClient.request<Contest>(
      `/v1/root/contests`,
      {
        method: "POST",
        data: {
          slug: randomUUID().substring(0, 30),
          title: "Test Contest",
          languages: ["CPP_17", "JAVA_21", "PYTHON_312", "NODE_22"],
          startAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
      },
    );
    const { data } = response;
    data["members"] = [];
    data["problems"] = [];
    return data;
  }

  async createMember(
    contest: Contest,
    type: MemberType,
    login: string,
    password: string,
  ): Promise<Contest> {
    const response = await this.apiClient.request<Contest>(
      `/v1/contests/${contest.id}`,
      {
        method: "PUT",
        data: {
          ...contest,
          members: [
            ...contest.members,
            {
              type: type,
              name: "Test Member",
              login: login,
              password: password,
            },
          ],
        },
      },
    );
    return response.data;
  }

  async createProblem(
    contest: Contest,
    timeLimit: number,
    memoryLimit: number,
  ): Promise<Contest> {
    const response = await this.apiClient.request<Contest>(
      `/v1/contests/${contest.id}`,
      {
        method: "PUT",
        data: {
          ...contest,
          problems: [
            ...contest.problems,
            {
              letter: String.fromCharCode(65 + contest.problems.length),
              color: "#000000",
              title: "Test Problem",
              description: {
                id: await this.uploadAttachment(
                  contest.id,
                  FileUtil.loadFile("description.pdf", "application/pdf"),
                  AttachmentContext.PROBLEM_DESCRIPTION,
                ),
              },
              timeLimit,
              memoryLimit,
              testCases: {
                id: await this.uploadAttachment(
                  contest.id,
                  FileUtil.loadFile("test_cases.csv", "text/csv"),
                  AttachmentContext.PROBLEM_TEST_CASES,
                ),
              },
            },
          ],
        },
      },
    );
    return response.data;
  }

  async forceStart(contest: Contest) {
    await this.apiClient.request(`/v1/contests/${contest.id}:force-start`, {
      method: "PUT",
    });
  }
}
