// eslint-disable-next-line no-restricted-imports
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import React from "react";

import { buildClientConfig, serverConfig } from "@/config/config";
import { Html } from "@/lib/component/html";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextIntlClientProvider locale={serverConfig.locale}>
      <Html>
        <script
          dangerouslySetInnerHTML={{
            __html: `globalThis.__CLIENT_CONFIG__ = ${JSON.stringify(buildClientConfig())};`,
          }}
        />
        {children}
      </Html>
    </NextIntlClientProvider>
  );
}
