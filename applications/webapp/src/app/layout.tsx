import "./globals.css";

import React from "react";

import { Html } from "@/app/_lib/component/layout/Html";

/**
 * The root layout for the web application.
 */
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Html>{children}</Html>;
}
