import { SubmissionLanguage } from "../../util/types";
import { Runner } from "./runner";

export class Python312Runner extends Runner {
  constructor() {
    super(SubmissionLanguage.PYTHON_312);
  }

  protected buildTimeLimitCode(power: number): string {
    return `
for _ in range(${10 ** power}):
    pass
print(2*int(input()))
`;
  }

  protected buildMemoryLimitCode(power: number): string {
    return `
a = [0] * ${10 ** power}
print(2*int(input()))
`;
  }

  protected buildCodeFile(code: string): File {
    const blob = new Blob([code], { type: "text/x-python" });
    const file = new File([blob], "code.py", { type: "text/x-python" });
    return file;
  }
}
