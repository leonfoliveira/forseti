import { test } from "@playwright/test";

import { Actor } from "@/test/actor/Actor";
import { Contest, ContestStatus } from "@/test/entity/Contest";
import { Leaderboard } from "@/test/entity/Leaderboard";
import { Member, MemberType } from "@/test/entity/Member";
import { Problem } from "@/test/entity/Problem";
import {
  Submission,
  SubmissionAnswer,
  SubmissionLanguage,
  SubmissionStatus,
} from "@/test/entity/Submission";
import { Announcement } from "@/test/entity/Announcement";

/**
 * This test covers the default behaviour of a contest
 */
test("Default contest behaviour", async ({ page }) => {
  await page.goto("/");

  const slug = Math.random().toString(36).substring(2, 15);
  const contest: Contest = {
    slug,
    title: "New Contest",
    status: ContestStatus.NOT_STARTED,
    startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
    endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    languages: [
      SubmissionLanguage.CPP_17,
      SubmissionLanguage.JAVA_21,
      SubmissionLanguage.PYTHON_312,
      SubmissionLanguage.NODE_22,
    ],
  };
  const problem: Problem = {
    letter: "A",
    title: "Two Sum",
    descriptionFile: "description.pdf",
    testCasesFile: "test_cases.csv",
    timeLimit: 1000,
    memoryLimit: 512,
  };
  const rootMember: Member = {
    type: MemberType.ROOT,
    name: "Root",
    login: "root",
    password: "forsetijudge",
  };
  const adminMember: Member = {
    type: MemberType.ADMIN,
    name: "Admin",
    login: "admin",
    password: "forsetijudge",
  };
  const judgeMember: Member = {
    type: MemberType.JUDGE,
    name: "Judge",
    login: "judge",
    password: "judge",
  };
  const contestantMember: Member = {
    type: MemberType.CONTESTANT,
    name: "Contestant",
    login: "contestant",
    password: "contestant",
  };

  const rootActor = new Actor(page, rootMember);
  const adminActor = new Actor(page, adminMember);
  const judgeActor = new Actor(page, judgeMember);
  const contestantActor = new Actor(page, contestantMember);

  const leaderboard: Leaderboard = {
    rows: [
      {
        memberName: contestantMember.name,
        score: 1,
        cells: [
          {
            isAccepted: true,
            wrongSubmissions: 4,
          },
        ],
      },
    ],
  };

  const tleSubmission: Submission = {
    member: contestantMember,
    problem: problem,
    language: SubmissionLanguage.PYTHON_312,
    code: "code_time_limit_exceeded.py",
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.TIME_LIMIT_EXCEEDED,
  };
  const reSubmission: Submission = {
    member: contestantMember,
    problem: problem,
    language: SubmissionLanguage.PYTHON_312,
    code: "code_runtime_error.py",
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.RUNTIME_ERROR,
  };
  const meSubmission: Submission = {
    member: contestantMember,
    problem: problem,
    language: SubmissionLanguage.PYTHON_312,
    code: "code_memory_limit_exceeded.py",
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
  };
  const waSubmission: Submission = {
    member: contestantMember,
    problem: problem,
    language: SubmissionLanguage.PYTHON_312,
    code: "code_wrong_answer.py",
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.WRONG_ANSWER,
  };
  const acSubmission: Submission = {
    member: contestantMember,
    problem: problem,
    language: SubmissionLanguage.PYTHON_312,
    code: "code_accepted.py",
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
  };

  const announcement: Announcement = {
    member: adminMember,
    text: "New announcement",
  };

  // Step 1: Use CLI to create a contest
  await rootActor.createContest(contest);

  // Step 2: Sign in as root and add members
  await rootActor.signIn(contest);
  const rootOnSettingsPage = await rootActor.navigateToSettings(contest);
  await rootOnSettingsPage.openTab("members");
  await rootOnSettingsPage.fillMemberForm(adminMember);
  await rootOnSettingsPage.fillMemberForm(judgeMember);
  await rootOnSettingsPage.fillMemberForm(contestantMember);
  await rootOnSettingsPage.saveSettings();
  await rootOnSettingsPage.signOut(contest);

  // Step 3: Sign in as contestant, check wait page
  await contestantActor.signIn(contest);
  await contestantActor.checkHeader(contest);
  await contestantActor.toggleTheme();
  await contestantActor.checkWaitPage();
  await contestantActor.signOut(contest);

  // Step 4: Sign in as admin, create and announcement, add a problem, and start the contest
  await adminActor.signIn(contest);
  await adminActor.checkHeader(contest);
  const adminActorOnAnnouncements =
    await adminActor.navigateToAnnouncements(contest);
  await adminActorOnAnnouncements.createAnnouncement(announcement);
  const adminActorOnSettings =
    await adminActorOnAnnouncements.navigateToSettings(contest);
  await adminActorOnSettings.openTab("problems");
  await adminActorOnSettings.fillProblemForm(problem);
  await adminActorOnSettings.openTab("contest");
  await adminActorOnSettings.saveSettings();
  await adminActorOnSettings.forceStart();
  contest.status = ContestStatus.IN_PROGRESS;
  await adminActor.signOut(contest);

  // Step 5: Sign in as contestant, check problems, create submissions, check announcements, check leaderboard
  await contestantActor.signIn(contest);
  await contestantActor.checkHeader(contest);
  const contestantActonOnProblems =
    await contestantActor.navigateToProblems(contest);
  await contestantActonOnProblems.checkProblems([problem]);
  const contestantActonOnSubmissions =
    await contestantActonOnProblems.navigateToSubmissions(contest);
  await contestantActonOnSubmissions.createSubmission(tleSubmission);
  await contestantActonOnSubmissions.createSubmission(reSubmission);
  await contestantActonOnSubmissions.createSubmission(meSubmission);
  await contestantActonOnSubmissions.createSubmission(waSubmission);
  await contestantActonOnSubmissions.createSubmission(acSubmission);
  const contestantActonOnLeaderboard =
    await contestantActonOnSubmissions.navigateToLeaderboard(contest);
  await contestantActonOnLeaderboard.checkLeaderboard(leaderboard);
  const contestantActonOnAnnouncements =
    await contestantActonOnLeaderboard.navigateToAnnouncements(contest);
  await contestantActonOnAnnouncements.checkAnnouncements([announcement]);
  await contestantActonOnAnnouncements.signOut(contest);

  // Step 6: Sign in as judge, check submissions, judge a submission, resubmit a submission
  await judgeActor.signIn(contest);
  await judgeActor.checkHeader(contest);
  const judgeActorOnSubmissions =
    await judgeActor.navigateToSubmissions(contest);
  await judgeActorOnSubmissions.checkSubmissions([
    acSubmission,
    waSubmission,
    meSubmission,
    reSubmission,
    tleSubmission,
  ]);
  await judgeActorOnSubmissions.downloadSubmission(0);
  await judgeActorOnSubmissions.judgeSubmission(
    0,
    SubmissionAnswer.WRONG_ANSWER,
  );
  await judgeActorOnSubmissions.resubmitSubmission(
    0,
    SubmissionAnswer.ACCEPTED,
  );
  await judgeActorOnSubmissions.signOut(contest);

  // Step 8: Sign in as admin, force end the contest
  await adminActor.signIn(contest);
  const adminActorOnSettings2 = await adminActor.navigateToSettings(contest);
  await adminActorOnSettings2.forceEnd();
  contest.status = ContestStatus.ENDED;
  await adminActorOnSettings2.checkHeader(contest);
});
