import React from "react";
import "./globals.css";
import { Html } from "@/app/_html";
import { getIntlConfig } from "@/app/_i18n/request";

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
