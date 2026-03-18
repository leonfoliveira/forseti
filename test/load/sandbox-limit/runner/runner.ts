import { SubmissionLanguage } from "../../util/types";

export abstract class Runner {
  constructor(public readonly language: SubmissionLanguage) {}

  buildTimeLimitCodeFile(power: number): File {
    return this.buildCodeFile(this.buildTimeLimitCode(power));
  }

  buildMemoryLimitCodeFile(power: number): File {
    return this.buildCodeFile(this.buildMemoryLimitCode(power));
  }

  protected abstract buildTimeLimitCode(power: number): string;

  protected abstract buildMemoryLimitCode(power: number): string;

  protected abstract buildCodeFile(code: string): File;
}
