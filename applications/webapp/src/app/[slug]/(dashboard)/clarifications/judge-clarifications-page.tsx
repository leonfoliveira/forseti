"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

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
        dispatch(judgeDashboardSlice.actions.mergeClarification(clarification));
      }}
      onDelete={(clarificationId: string) => {
        dispatch(
          judgeDashboardSlice.actions.deleteClarification(clarificationId),
        );
      }}
    />
  );
}
