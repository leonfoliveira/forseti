import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPage";

export function SpectatorClarificationsPage() {
  const problems = useAppSelector((state) => state.spectatorDashboard.problems);
  const clarifications = useAppSelector(
    (state) => state.spectatorDashboard.clarifications,
  );

  return (
    <ClarificationsPage problems={problems} clarifications={clarifications} />
  );
}
