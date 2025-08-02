"use client";

import React from "react";
import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";

export default function JudgeProblemsPage() {
  const { contest } = useJudgeContext();

  return <ProblemsPage contest={contest} />;
}
