import { Actor } from "../util/actor";

export class Runner {
  constructor(
    public readonly language: string,
    private readonly actor: Actor,
    private readonly problemId: string
  ) {}

  async submitCode(file: File, language: string) {
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

  async pullSubmission(submissionId: string) {
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

  buildTimeLimitCode(multiplier: number) {}

  buildMemoryLimitCode(multiplier: number) {}

  buildFile(code: string) {}
}
