"use client";

import React from "react";
import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";

export default function JuryProblemsPage() {
  const { contest } = useJuryContext();

  return <ProblemsPage contest={contest} />;
}
