import { Actor } from "../util/actor";

export class Runner {
  constructor(
    private readonly actor: Actor,
    private readonly problemId: string
  ) {}

  private readonly code = `
import time
time.sleep(0.5)
print(2*input())
`;

  async submitCode(file: File) {
    const attachmentId = await this.actor.uploadAttachment(
      file,
      "SUBMISSION_CODE"
    );
    await this.actor.createSubmission(
      this.problemId,
      "PYTHON_312",
      attachmentId
    );
  }

  async hasJudgingSubmission() {
    const submissions = await this.actor.findAllSubmissionsForMember();
    const submissionsForProblem = submissions.filter(
      (s) => s.problem.id === this.problemId
    );
    const judgingSubmissions = submissionsForProblem.filter(
      (s) => s.status === "JUDGING"
    );
    console.log(`Judging submissions: ${judgingSubmissions.length}`);
    return judgingSubmissions.length > 0;
  }

  buildFile() {
    const blob = new Blob([this.code], { type: "text/x-python" });
    const file = new File([blob], "code.py", { type: "text/x-python" });
    return file;
  }
}
