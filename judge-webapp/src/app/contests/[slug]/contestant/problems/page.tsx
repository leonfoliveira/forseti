"use client";

import React, { useMemo } from "react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

export default function ContestantProblemsPage() {
  const problems = useContestantDashboard((state) => state.contest.problems);
  const submissions = useContestantDashboard((state) => state.submissions);

  /**
   * Builds and object with the amount of every answer for each problem.
   * ie: { [problemId]: { [SubmissionAnswer]: [amount] } }
   */
  const status = useMemo(() => {
    const answerBlock = Object.values(SubmissionAnswer).reduce(
      (acc, answer) => {
        return { ...acc, [answer]: 0 };
      },
      {},
    );

    const status: Record<
      string,
      Record<SubmissionAnswer, number>
    > = problems.reduce((acc, problem) => {
      return { ...acc, [problem.id]: { ...answerBlock } };
    }, {});

    submissions.forEach((submission) => {
      status[submission.problem.id][submission.answer]++;
    });

    return status;
  }, [problems, submissions]);

  return <ProblemsPage problems={problems} contestantStatus={status} />;
}
