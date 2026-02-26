import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { judgeDashboardSlice } from "@/app/_store/slices/dashboard/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

export function JudgeSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.judgeDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.judgeDashboard.problems);
  const dispatch = useAppDispatch();

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      canViewExecutions
      canEdit
      onEdit={(submission: SubmissionWithCodeAndExecutionsResponseDTO) => {
        dispatch(judgeDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
