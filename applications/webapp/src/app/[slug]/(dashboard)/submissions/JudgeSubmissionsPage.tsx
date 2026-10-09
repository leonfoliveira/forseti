import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { JudgeDashboardSlice } from "@/app/_lib/store/slice/dashboard/JudgeDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

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
        dispatch(JudgeDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
