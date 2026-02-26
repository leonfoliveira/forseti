"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { adminDashboardSlice } from "@/app/_store/slices/dashboard/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export function AdminClarificationsPage() {
  const problems = useAppSelector((state) => state.adminDashboard.problems);
  const clarifications = useAppSelector(
    (state) => state.adminDashboard.clarifications,
  );
  const dispatch = useAppDispatch();

  return (
    <ClarificationsPage
      problems={problems}
      clarifications={clarifications}
      canAnswer
      onAnswer={(clarification: ClarificationResponseDTO) => {
        dispatch(adminDashboardSlice.actions.mergeClarification(clarification));
      }}
      onDelete={(clarificationId: string) => {
        dispatch(
          adminDashboardSlice.actions.deleteClarification(clarificationId),
        );
      }}
    />
  );
}
