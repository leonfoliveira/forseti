"use client";

import React from "react";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";

export default function JuryClarificationsPage() {
  const { contest } = useJuryContext();

  return <ClarificationsPage contest={contest} canAnswer />;
}
