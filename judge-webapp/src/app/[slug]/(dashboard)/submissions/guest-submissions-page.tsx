import React from "react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { useAppSelector } from "@/store/store";

export function GuestSubmissionsPage() {
  const submissions = useAppSelector(
    (state) => state.guestDashboard.data!.submissions,
  );

  return <SubmissionsPage submissions={submissions} />;
}
