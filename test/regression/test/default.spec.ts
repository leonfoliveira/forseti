import { test } from "@playwright/test";

import { ContestantActor } from "@/test/actor/contestant-actor";
import { JudgeActor } from "@/test/actor/judge-actor";
import { RootActor } from "@/test/actor/root-actor";
import { Member, MemberType } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";
import {
  Submission,
  SubmissionAnswer,
  SubmissionLanguage,
} from "@/test/entity/submission";

test("Default contest behaviour", async ({ page }) => {
  await page.goto("/");

  const slug = Math.random().toString(36).substring(2, 15);
  const problem = new Problem(
    "A",
    "Two Sum",
    "description.pdf",
    "test_cases.csv",
    1000,
    512,
  );
  const rootMember = new Member(MemberType.ROOT, "Root", "root", "judge");
  const judgeMember = new Member(MemberType.JUDGE, "Judge", "judge", "judge");
  const contestantMember = new Member(
    MemberType.CONTESTANT,
    "Contestant",
    "contestant",
    "contestant",
  );

  const rootActor = new RootActor(page, slug, rootMember);
  const contestantActor = new ContestantActor(page, slug, contestantMember);
  const judgeActor = new JudgeActor(page, slug, judgeMember);

  const tleSubmission = new Submission(
    problem,
    SubmissionLanguage.PYTHON_312,
    "code_time_limit_exceeded.py",
    SubmissionAnswer.TIME_LIMIT_EXCEEDED,
  );
  const reSubmission = new Submission(
    problem,
    SubmissionLanguage.PYTHON_312,
    "code_runtime_error.py",
    SubmissionAnswer.RUNTIME_ERROR,
  );
  const meSubmission = new Submission(
    problem,
    SubmissionLanguage.PYTHON_312,
    "code_memory_limit_exceeded.py",
    SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
  );
  const waSubmission = new Submission(
    problem,
    SubmissionLanguage.PYTHON_312,
    "code_wrong_answer.py",
    SubmissionAnswer.WRONG_ANSWER,
  );
  const acSubmission = new Submission(
    problem,
    SubmissionLanguage.PYTHON_312,
    "code_accepted.py",
    SubmissionAnswer.ACCEPTED,
  );

  await rootActor.createContest();
  await rootActor.signIn();
  await rootActor.navigate("Settings");
  await rootActor.addProblem(problem);
  await rootActor.addMember(contestantMember);
  await rootActor.addMember(judgeMember);
  await rootActor.forceStart();

  await contestantActor.signIn();
  await contestantActor.navigate("Leaderboard");
  await contestantActor.checkoutLeaderboard(0);
  await contestantActor.navigate("Problems");
  await contestantActor.checkProblems([problem]);
  await contestantActor.navigate("Submissions");
  await contestantActor.createSubmission(tleSubmission);
  await contestantActor.createSubmission(reSubmission);
  await contestantActor.createSubmission(meSubmission);
  await contestantActor.createSubmission(waSubmission);
  await contestantActor.createSubmission(acSubmission);
  await contestantActor.navigate("Leaderboard");
  await contestantActor.checkoutLeaderboard(1);
  await contestantActor.navigate("Clarifications");
  await contestantActor.createClarification(
    problem,
    "What is the input format?",
  );

  await judgeActor.signIn();
  await judgeActor.navigate("Submissions");
  await judgeActor.checkoutSubmissions([
    acSubmission,
    waSubmission,
    meSubmission,
    reSubmission,
    tleSubmission,
  ]);
  await judgeActor.judgeSubmission(0, SubmissionAnswer.WRONG_ANSWER);
  await judgeActor.navigate("Clarifications");
  await judgeActor.answerClarification(
    0,
    "The input format is a list of integers",
  );
  await judgeActor.navigate("Announcements");
  await judgeActor.createAnnouncement("The contest will end in 1 hour");
});
