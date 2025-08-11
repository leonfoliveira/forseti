"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";

export default function JudgeAnnouncementsPage() {
  const { contest } = useJudgeContext();

  return <AnnouncementsPage contest={contest} canCreate />;
}
