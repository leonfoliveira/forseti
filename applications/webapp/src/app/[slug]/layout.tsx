import React from "react";

import ContestLayout from "@/app/[slug]/ContestLayout";

// The real slug is only known at runtime, so a single placeholder page is
// exported and the host must rewrite /<any-slug>/* to /_/*.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContestLayout>{children}</ContestLayout>;
}
