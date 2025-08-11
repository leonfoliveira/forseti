"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function GuestAnnouncementsPage() {
  const { contest } = useGuestContext();

  return <AnnouncementsPage contest={contest} />;
}
