import { SubmissionLanguage } from "../../util/types";
import { Runner } from "./runner";

export class Node22Runner extends Runner {
  constructor() {
    super(SubmissionLanguage.NODE_22);
  }

  protected buildTimeLimitCode(power: number): string {
    return `
const fs = require('fs');
async function main() {
    for (let i = 0; i < ${10 ** power}; i++) {}
    const input = fs.readFileSync(0, 'utf8');
    console.log(2 * parseInt(input.trim()));
}
main();
`;
  }

  protected buildMemoryLimitCode(power: number): string {
    return `
const fs = require('fs');
arr = []
for (let i = 0; i < ${10 ** power}; i++) {
    arr.push(i)
}
const input = fs.readFileSync(0, 'utf8');
console.log(2 * parseInt(input.trim()));
`;
  }

  protected buildCodeFile(code: string): File {
    const blob = new Blob([code], { type: "text/x-javascript" });
    const file = new File([blob], "code.js", { type: "text/x-javascript" });
    return file;
  }
}
