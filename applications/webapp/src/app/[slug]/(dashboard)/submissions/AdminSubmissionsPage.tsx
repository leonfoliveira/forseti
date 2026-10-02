import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { AdminDashboardSlice } from "@/app/_store/slice/dashboard/AdminDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_store/Store";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
      canViewExecutions
      canEdit
      onEdit={(submission: SubmissionWithCodeResponseDTO) => {
        dispatch(AdminDashboardSlice.actions.mergeSubmission(submission));
      }}
    />
  );
}
