import { Runner } from "../runner.js";

class Python312Runner extends Runner {
  constructor(actor, problemId) {
    super("PYTHON_3_12", actor, problemId);
  }

  buildTimeLimitCode(multiplier) {
    return `
import time
time.sleep(${0.1 * multiplier})
print(2*int(input()))
`;
  }

  buildMemoryLimitCode(multiplier) {
    return `
a = [0] * ${10 ** multiplier}
print(2*int(input()))
`;
  }

  buildFile(code) {
    const blob = new Blob([code], { type: "text/x-python" });
    const file = new File([blob], "code.py", { type: "text/x-python" });
    return file;
  }
}

export { Python312Runner };
