"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { useAppSelector } from "@/app/_store/store";

export function GuestClarificationsPage() {
  const problems = useAppSelector((state) => state.guestDashboard.problems);
  const clarifications = useAppSelector(
    (state) => state.guestDashboard.clarifications,
  );

  return (
    <ClarificationsPage problems={problems} clarifications={clarifications} />
  );
}
