"use client";

import React from "react";
import Layout from "@/app/_component/layout.";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout signInPath="/auth/root">{children}</Layout>;
}
