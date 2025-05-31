"use client";

import React from "react";
import { Navbar } from "@/app/_component/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar signInPath="/auth/root" data-testid="navbar" />
      <div className="mt-5 p-10 bg-base-100">{children}</div>
    </div>
  );
}
