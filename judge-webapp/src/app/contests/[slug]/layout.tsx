"use client";

import React, { use } from "react";
import { ContestMetadataProvider } from "@/app/contests/[slug]/_component/context/contest-metadata-context";

export default function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = use(params);

  return (
    <ContestMetadataProvider slug={slug}>{children}</ContestMetadataProvider>
  );
}
