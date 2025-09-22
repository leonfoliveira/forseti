class Actor {
  constructor(apiClient, contestId) {
    this.apiClient = apiClient;
    this.contestId = contestId;
  }

  async signIn(login, password) {
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
    const cookies = response.headers.get("set-cookie");
    const sessionId = /session_id=([^;]+)/.exec(cookies)[1];
    this.apiClient.sessionId = sessionId;
  }

  async uploadAttachment(file, context) {
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
    const data = await response.json();
    return data.id;
  }

  async createSubmission(problemId, language, attachmentId) {
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
    const data = await response.json();
    return data.id;
  }

  async findAllSubmissionsForMember() {
    const response = await this.apiClient.request(
      `/v1/contests/${this.contestId}/submissions/full/members/me`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  }
}

module.exports = { Actor };
