import "dotenv/config";
import { ApiClient } from "../util/api-client";
import { RootActor } from "../util/actor/root-actor";
import { ContestantActor } from "../util/actor/contestant-actor";
import { Cpp17Runner } from "./runner/cpp17-runner";
import { Java21Runner } from "./runner/java21-runner";
import { Python312Runner } from "./runner/python312-runner";
import { Node22Runner } from "./runner/node22-runner";
import { MemberType, SubmissionAnswer, SubmissionStatus } from "../util/types";

const apiUrl = process.env.API_URL || "http://localhost:8080";
const rootPassword = process.env.ROOT_PASSWORD || "forsetijudge";

async function main() {
  const runners = [
    new Cpp17Runner(),
    new Java21Runner(),
    new Python312Runner(),
    new Node22Runner(),
  ];

  const rootActor = new RootActor(new ApiClient(apiUrl));
  await rootActor.signIn(rootPassword);
  let contest = await rootActor.createContest();
  contest = await rootActor.createMember(
    contest,
    MemberType.CONTESTANT,
    "contestant",
    "contestant",
  );
  contest = await rootActor.createProblem(contest, 1000, 1024);
  const problemId = contest.problems[0]!.id;
  await rootActor.forceStart(contest);

  const contestantActor = new ContestantActor(new ApiClient(apiUrl));
  await contestantActor.signIn(contest.id, "contestant", "contestant");

  async function pullSubmission(submissionId: string) {
    while (true) {
      const adminDashboard = await rootActor.getDashboard(contest.id);
      const submission = adminDashboard.submissions.find(
        (s) => s.id === submissionId,
      );
      if (submission?.status === SubmissionStatus.JUDGED) {
        return submission;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async function testTimeLimit() {
    const limits = [];

    for (const runner of runners) {
      const results = [];
      let power = 0;
      while (true) {
        const codeFile = runner.buildTimeLimitCodeFile(power);
        const submissionId = await contestantActor.createSubmission(
          contest.id,
          problemId,
          runner.language,
          codeFile,
        );
        const submission = await pullSubmission(submissionId);
        const result = {
          language: runner.language,
          power,
          answer: submission.answer,
          maxCpuTime: submission.executions[0]?.maxCpuTime,
          maxClockTime: submission.executions[0]?.maxClockTime,
        };

        console.log(
          `[${runner.language}][TLE] Power: ${power} => ${submission.answer}, Max CPU Time: ${result.maxCpuTime} ms, Max Clock Time: ${result.maxClockTime} ms`,
        );

        results.push(result);
        if (submission.answer !== SubmissionAnswer.ACCEPTED) {
          limits.push(result);
          break;
        }
        power += 1;
      }
      console.log();
      console.table(results);
    }
    console.table(limits);
  }

  async function testMemoryLimit() {
    const limits = [];

    for (const runner of runners) {
      const results = [];
      let power = 0;
      while (true) {
        const codeFile = runner.buildMemoryLimitCodeFile(power);
        const submissionId = await contestantActor.createSubmission(
          contest.id,
          problemId,
          runner.language,
          codeFile,
        );
        const submission = await pullSubmission(submissionId);
        const result = {
          language: runner.language,
          power,
          answer: submission.answer,
          maxPeakMemory: submission.executions[0]?.maxPeakMemory,
        };

        console.log(
          `[${runner.language}][MLE] Power: ${power} => ${submission.answer}, Max Peak Memory: ${result.maxPeakMemory} KB`,
        );

        results.push(result);
        if (submission.answer !== SubmissionAnswer.ACCEPTED) {
          limits.push(result);
          break;
        }
        power += 1;
      }
      console.log();
      console.table(results);
    }
    console.table(limits);
  }

  await testTimeLimit();
  await testMemoryLimit();
}

main();
