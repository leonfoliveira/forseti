import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { ContestantDashboardSlice } from "@/app/_lib/store/slice/dashboard/ContestantDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export function ContestantClarificationsPage() {
  const problems = useAppSelector(
    (state) => state.contestantDashboard.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.contestantDashboard.clarifications,
  );
  const dispatch = useAppDispatch();

  return (
    <ClarificationsPage
      problems={problems}
      clarifications={clarifications}
      canCreate
      onCreate={(clarification: ClarificationResponseDTO) => {
        dispatch(
          ContestantDashboardSlice.actions.mergeClarification(clarification),
        );
      }}
    />
  );
}
