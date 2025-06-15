import React from "react";
import "./globals.css";
import { Html } from "@/app/_html";
import { getIntlConfig } from "@/i18n/request";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Judge",
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getIntlConfig();

  return (
    <Html locale={locale} messages={messages as any}>
      {children}
    </Html>
  );
}
