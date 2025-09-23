import { Actor } from "../../util/actor";
import { Runner } from "../runner";

export class Python312Runner extends Runner {
  constructor(actor: Actor, problemId: string) {
    super("PYTHON_312", actor, problemId);
  }

  buildTimeLimitCode(multiplier: number) {
    return `
import time
time.sleep(${0.1 * multiplier})
print(2*int(input()))
`;
  }

  buildMemoryLimitCode(multiplier: number) {
    return `
a = [0] * ${10 ** multiplier}
print(2*int(input()))
`;
  }

  buildFile(code: string) {
    const blob = new Blob([code], { type: "text/x-python" });
    const file = new File([blob], "code.py", { type: "text/x-python" });
    return file;
  }
}
