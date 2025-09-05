// eslint-disable-next-line no-restricted-imports
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import React from "react";

import { env } from "@/config/env";
import { Html } from "@/lib/component/html";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextIntlClientProvider locale={env.LOCALE}>
      <Html>{children}</Html>
    </NextIntlClientProvider>
  );
}
