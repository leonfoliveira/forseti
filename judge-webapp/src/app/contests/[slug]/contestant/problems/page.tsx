"use client";

import React, { useMemo } from "react";
import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantProblemsPage() {
  const { contest, submissions } = useContestantContext();

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
    > = contest.problems.reduce((acc, problem) => {
      return { ...acc, [problem.id]: { ...answerBlock } };
    }, {});

    submissions.forEach((submission) => {
      status[submission.problem.id][submission.answer]++;
    });

    return status;
  }, [contest.problems, submissions]);

  return <ProblemsPage contest={contest} contestantStatus={status} />;
}
