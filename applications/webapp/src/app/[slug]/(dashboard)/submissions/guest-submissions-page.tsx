import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page";
import { useAppSelector } from "@/app/_store/store";

export function GuestSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.guestDashboard.submissions,
  );

  return <SubmissionsPage submissions={submissions} />;
}
