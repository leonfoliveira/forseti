import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { JudgeDashboardSlice } from "@/app/_lib/store/slice/dashboard/JudgeDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export function JudgeClarificationsPage() {
  const problems = useAppSelector((state) => state.judgeDashboard.problems);
  const clarifications = useAppSelector(
    (state) => state.judgeDashboard.clarifications,
  );
  const dispatch = useAppDispatch();

  return (
    <ClarificationsPage
      problems={problems}
      clarifications={clarifications}
      canAnswer
      onAnswer={(clarification: ClarificationResponseDTO) => {
        dispatch(JudgeDashboardSlice.actions.mergeClarification(clarification));
      }}
      onPublish={(clarification: ClarificationResponseDTO) => {
        dispatch(JudgeDashboardSlice.actions.mergeClarification(clarification));
      }}
    />
  );
}
