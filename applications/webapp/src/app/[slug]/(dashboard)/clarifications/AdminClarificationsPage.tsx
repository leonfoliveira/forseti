"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

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
        dispatch(AdminDashboardSlice.actions.mergeClarification(clarification));
      }}
      onPublish={(clarification: ClarificationResponseDTO) => {
        dispatch(AdminDashboardSlice.actions.mergeClarification(clarification));
      }}
    />
  );
}
