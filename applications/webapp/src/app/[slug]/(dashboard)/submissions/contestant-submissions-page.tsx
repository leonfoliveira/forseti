import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";

export function ContestantSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.contestantDashboard.submissions,
  );
  const memberSubmissions = useAppSelector(
    (state) => state.contestantDashboard.memberSubmissions,
  );
  const problems = useAppSelector(
    (state) => state.contestantDashboard.contest.problems,
  );
  const dispatch = useAppDispatch();

  return (
    <SubmissionsPage
      submissions={submissions}
      memberSubmissions={memberSubmissions}
      problems={problems}
      canCreate
      onCreate={(submission: SubmissionFullResponseDTO) => {
        dispatch(contestantDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
