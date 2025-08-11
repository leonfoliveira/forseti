"use client";

import React from "react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function GuestProblemsPage() {
  const { contest } = useGuestContext();

  return <ProblemsPage contest={contest} />;
}
