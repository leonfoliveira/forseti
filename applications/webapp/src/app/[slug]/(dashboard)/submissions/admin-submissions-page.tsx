import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

export function AdminSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.adminDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.adminDashboard.problems);
  const dispatch = useAppDispatch();

  return (
    <SubmissionsPage
      submissions={submissions}
      problems={problems}
      canEdit
      onEdit={(submission: SubmissionWithCodeAndExecutionsResponseDTO) => {
        dispatch(adminDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
