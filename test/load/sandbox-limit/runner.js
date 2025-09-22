class Runner {
  constructor(language, actor, problemId) {
    this.language = language;
    this.actor = actor;
    this.problemId = problemId;
  }

  async submitCode(file, language) {
    const attachmentId = await this.actor.uploadAttachment(
      file,
      "SUBMISSION_CODE"
    );
    const submissionId = await this.actor.createSubmission(
      this.problemId,
      language,
      attachmentId
    );
    const submission = await this.pullSubmission(submissionId);
    return submission;
  }

  async pullSubmission(submissionId) {
    while (true) {
      const submissions = await this.actor.findAllSubmissionsForMember();
      const submission = submissions.find((s) => s.id === submissionId);
      if (!submission || submission.status === "JUDGING") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      return submission;
    }
  }

  buildTimeLimitCode(multiplier) {}

  buildMemoryLimitCode(multiplier) {}

  buildFile(code) {}
}

export { Runner };
