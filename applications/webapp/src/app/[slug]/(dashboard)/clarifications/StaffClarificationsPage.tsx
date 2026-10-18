import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function StaffClarificationsPage() {
  const problems = useAppSelector((state) => state.staffDashboard.problems);
  const clarifications = useAppSelector(
    (state) => state.staffDashboard.clarifications,
  );

  return (
    <ClarificationsPage problems={problems} clarifications={clarifications} />
  );
}
