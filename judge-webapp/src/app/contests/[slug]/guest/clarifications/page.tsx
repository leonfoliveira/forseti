"use client";

import React from "react";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function GuestClarificationsPage() {
  const { contest } = useGuestContext();

  return <ClarificationsPage contest={contest} />;
}
