// eslint-disable-next-line no-restricted-imports
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import React from "react";

import { config } from "@/config/config";
import { Html } from "@/lib/component/html";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextIntlClientProvider locale={config.locale}>
      <Html>{children}</Html>
    </NextIntlClientProvider>
  );
}
