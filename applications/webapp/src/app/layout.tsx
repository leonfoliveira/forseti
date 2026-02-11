// eslint-disable-next-line no-restricted-imports
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import React from "react";

import { Html } from "@/app/_lib/component/layout/html";
import { buildClientConfig, serverConfig } from "@/config/config";

/**
 * The root layout for the web application.
 * Initializes internationalization and injects client configuration.
 */
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
