"use client";

import React from "react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";

export default function JudgeClarificationsPage() {
  const { contest } = useJudgeContext();

  return <ClarificationsPage contest={contest} canAnswer />;
}
