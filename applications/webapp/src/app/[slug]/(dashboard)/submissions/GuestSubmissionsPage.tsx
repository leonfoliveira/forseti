import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { useAppSelector } from "@/app/_store/Store";

export function GuestSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.guestDashboard.submissions,
  );
  const problems = useAppSelector((state) => state.guestDashboard.problems);

  return <SubmissionsPage submissions={submissions} problems={problems} />;
}
