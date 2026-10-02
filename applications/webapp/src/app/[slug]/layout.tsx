import React from "react";

import ContestLayout from "@/app/[slug]/ContestLayout";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContestLayout>{children}</ContestLayout>;
}
