import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";

export function JudgeSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.judgeDashboard.submissions,
  );
  const problems = useAppSelector(
    (state) => state.judgeDashboard.contest.problems,
  );
  const dispatch = useAppDispatch();

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      canEdit
      onEdit={(submission: SubmissionFullResponseDTO) => {
        dispatch(judgeDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
