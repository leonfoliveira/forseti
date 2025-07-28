"use client";

import React from "react";
import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";

export default function JuryAnnouncementsPage() {
  const { contest } = useJuryContext();

  return <AnnouncementsPage contest={contest} canCreate />;
}
