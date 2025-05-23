"use client";

import React from "react";
import Template from "@/app/_component/template";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Template signInPath="/auth/root">{children}</Template>;
}
