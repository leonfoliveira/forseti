"use client";

import React, { useMemo } from "react";
import { ProblemPage } from "@/app/contests/[slug]/_component/page/problems-page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";

export default function ContestantProblemsPage() {
  const { contest } = useContest();
  const {
    contestant: { submissions },
  } = useContest();

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

  return <ProblemPage contestantStatus={status} />;
}
