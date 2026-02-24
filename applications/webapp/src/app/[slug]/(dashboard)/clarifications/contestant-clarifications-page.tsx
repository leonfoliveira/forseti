"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

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
          contestantDashboardSlice.actions.mergeClarification(clarification),
        );
      }}
    />
  );
}
