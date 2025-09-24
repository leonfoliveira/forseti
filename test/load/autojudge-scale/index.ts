import "dotenv/config";
import { ApiClient } from "../util/api";
import { Actor } from "../util/actor";
import { Runner } from "./runner";

const apiUrl = process.env.API_URL || "https://api.judge.app";
const rootPassword = process.env.ROOT_PASSWORD as string;
const submissionCount = parseInt(process.env.SUBMISSION_COUNT || "10", 10);
const batchSize = 15;

const apiClient = new ApiClient(apiUrl);

async function main() {
  const actor = new Actor(apiClient);
  await actor.signIn(rootPassword);
  await actor.createContest();
  const problem = await actor.createProblem();
  await actor.forceStart();
  const problemId = problem.id;

  const runner = new Runner(actor, problemId);

  const file = runner.buildFile();

  let remaining = submissionCount;
  while (remaining > 0) {
    console.log(`Submitting ${Math.min(remaining, batchSize)} submissions...`);
    const promises = [];
    for (let i = 0; i < Math.min(remaining, batchSize); i++) {
      promises.push(runner.submitCode(file));
    }
    await Promise.all(promises);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    remaining -= batchSize;
  }

  let hasJudgingSubmission = true;
  const start = Date.now();
  while (hasJudgingSubmission) {
    console.log("Waiting...");
    hasJudgingSubmission = await runner.hasJudgingSubmission();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const end = Date.now();
  const duration = (end - start) / 1000;

  console.log(`All submissions judged in ${duration} seconds.`);
}

main();
