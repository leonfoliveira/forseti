import "dotenv/config";
import { ApiClient } from "../util/api";
import { Actor } from "../util/actor";
import { Cpp17Runner } from "./runner/cpp17-runner";
import { Java21Runner } from "./runner/java21-runner";
import { Python312Runner } from "./runner/python312-runner";

const apiUrl = process.env.API_URL || "https://api.forsetijudge.com/api";
const rootPassword = process.env.ROOT_PASSWORD as string;

const apiClient = new ApiClient(apiUrl);

async function main() {
  const actor = new Actor(apiClient);
  await actor.signIn(rootPassword);
  await actor.createContest();
  const problem = await actor.createProblem();
  await actor.forceStart();
  const problemId = problem.id;

  const runners = [
    new Cpp17Runner(actor, problemId),
    new Java21Runner(actor, problemId),
    new Python312Runner(actor, problemId),
  ];
  const results = [];

  for (const runner of runners) {
    let tleMultiplier = 0;
    let tleAnswer;
    while (true) {
      const code = runner.buildTimeLimitCode(tleMultiplier);
      const file = runner.buildFile(code);
      const submission = await runner.submitCode(file, runner.language);
      tleAnswer = submission.answer;
      console.log(
        `[${runner.language}][TLE] Multiplier: ${tleMultiplier} => ${tleAnswer}`
      );
      if (tleAnswer !== "ACCEPTED") break;
      tleMultiplier += 1;
    }
    console.log();

    let mleMultiplier = 0;
    let mleAnswer;
    while (true) {
      const code = runner.buildMemoryLimitCode(mleMultiplier);
      const file = runner.buildFile(code);
      const submission = await runner.submitCode(file, runner.language);
      mleAnswer = submission.answer;
      console.log(
        `[${runner.language}][MLE] Multiplier: ${mleMultiplier} => ${mleAnswer}`
      );
      if (mleAnswer !== "ACCEPTED") break;
      mleMultiplier += 1;
    }
    console.log();

    results.push({
      language: runner.language,
      TLE: tleMultiplier,
      MLE: mleMultiplier,
    });
  }

  console.table(results);
}

main();
