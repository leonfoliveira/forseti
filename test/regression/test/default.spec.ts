import { test } from "@playwright/test";

import { Actor } from "@/test/actor/actor";
import { Announcement } from "@/test/entity/announcement";
import { Clarification } from "@/test/entity/clarification";
import { Contest, ContestStatus } from "@/test/entity/contest";
import { Member, MemberType } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";
import {
  Submission,
  SubmissionAnswer,
  SubmissionLanguage,
  SubmissionStatus,
} from "@/test/entity/submission";
import { Ticket, TicketStatus, TicketType } from "@/test/entity/ticket";
import { DateUtil } from "@/test/util/date-util";

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
    startAt: DateUtil.toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)), // 1 hour later
    endAt: DateUtil.toDatetimeLocal(new Date(Date.now() + 2 * 60 * 60 * 1000)), // 2 hours later
    languages: [
      SubmissionLanguage.CPP_17,
      SubmissionLanguage.JAVA_21,
      SubmissionLanguage.PYTHON_312,
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
  const staffMember: Member = {
    type: MemberType.STAFF,
    name: "Staff",
    login: "staff",
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
  const staffActor = new Actor(page, staffMember);
  const judgeActor = new Actor(page, judgeMember);
  const contestantActor = new Actor(page, contestantMember);

  const leaderboard = {
    members: [
      {
        name: contestantMember.name,
        score: 1,
        problems: [
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

  const clarification: Clarification = {
    member: contestantMember,
    problem: problem,
    text: "New clarification",
  };

  const announcement: Announcement = {
    member: adminMember,
    text: "New announcement",
  };

  const tickets: Ticket[] = [
    {
      member: contestantMember,
      type: TicketType.SUBMISSION_PRINT,
      status: TicketStatus.OPEN,
      description: "Please, print my submission",
    },
    {
      member: contestantMember,
      type: TicketType.TECHNICAL_SUPPORT,
      status: TicketStatus.OPEN,
      description: "I have a problem with the judge system",
    },
  ];

  // Step 1: Use CLI to create a contest
  await rootActor.createContest(contest);

  // Step 2: Sign in as root and add members
  await rootActor.signIn(contest);
  const rootOnSettingsPage = await rootActor.navigateToSettings(contest);
  await rootOnSettingsPage.openTab("members");
  await rootOnSettingsPage.fillMemberForm(adminMember);
  await rootOnSettingsPage.fillMemberForm(staffMember);
  await rootOnSettingsPage.fillMemberForm(judgeMember);
  await rootOnSettingsPage.fillMemberForm(contestantMember);
  await rootOnSettingsPage.saveSettings();
  await rootOnSettingsPage.signOut(contest);

  // Step 3: Sign in as contestant, check wait page
  await contestantActor.signIn(contest);
  await contestantActor.checkHeader(contest);
  await contestantActor.toggleTheme();
  await contestantActor.checkWaitPage(contest);
  await contestantActor.signOut(contest);

  // Step 4: Sign in as admin, create an announcement, add a problem, and start the contest
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

  // Step 5: Sign in as contestant, check problems, create submissions, request print, check leaderboard, create clarification, check announcements, check tickets, create a ticket
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
  await contestantActonOnSubmissions.requestPrint(0);
  const contestantActonOnLeaderboard =
    await contestantActonOnSubmissions.navigateToLeaderboard(contest);
  await contestantActonOnLeaderboard.checkLeaderboard(leaderboard);
  const contestantActonOnClarifications =
    await contestantActonOnLeaderboard.navigateToClarifications(contest);
  await contestantActonOnClarifications.createClarification(clarification);
  const contestantActonOnAnnouncements =
    await contestantActonOnClarifications.navigateToAnnouncements(contest);
  await contestantActonOnAnnouncements.checkAnnouncements([announcement]);
  const contestantActonOnTickets =
    await contestantActonOnAnnouncements.navigateToTickets(contest);
  await contestantActonOnTickets.checkTickets([tickets[0]]);
  await contestantActonOnTickets.createTicket(tickets[1]);
  await contestantActonOnTickets.signOut(contest);

  // Step 6: Sign in as judge, check submissions, judge a submission, rerun a submission, answer a clarification, delete a clarification
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
  await judgeActorOnSubmissions.checkExecutions(0, SubmissionAnswer.ACCEPTED);
  await judgeActorOnSubmissions.judgeSubmission(
    0,
    SubmissionAnswer.WRONG_ANSWER,
  );
  await judgeActorOnSubmissions.rerunSubmission(0, SubmissionAnswer.ACCEPTED);
  const judgeActorOnClarifications =
    await judgeActorOnSubmissions.navigateToClarifications(contest);
  await judgeActorOnClarifications.answerClarification(0);
  await judgeActorOnClarifications.deleteClarification(0);
  await judgeActorOnClarifications.signOut(contest);

  // Step 7: Sign in as staff, check tickets, move a ticket
  await staffActor.signIn(contest);
  await staffActor.checkHeader(contest);
  const staffActorOnTickets = await staffActor.navigateToTickets(contest);
  await staffActorOnTickets.checkTickets(tickets);
  await staffActorOnTickets.moveTicket(
    0,
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
  );
  await staffActorOnTickets.signOut(contest);

  // Step 8: Sign in as admin, force end the contest
  await adminActor.signIn(contest);
  const adminActorOnSettings2 = await adminActor.navigateToSettings(contest);
  await adminActorOnSettings2.freeze();
  await adminActorOnSettings2.forceEnd();
  contest.status = ContestStatus.ENDED;
  await adminActorOnSettings2.checkHeader(contest);
  await adminActorOnSettings2.unfreeze();
});
