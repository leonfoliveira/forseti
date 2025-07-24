"use client";

import React from "react";
import { useTheme } from "@/app/_util/theme-hook";
import { NextIntlClientProvider } from "next-intl";
import { Roboto } from "next/font/google";
import { AuthorizationProvider } from "@/app/_context/authorization-context";
import { NotificationProvider } from "@/app/_context/notification-context";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export function Html({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  const { theme } = useTheme();

  return (
    <html lang={locale} data-theme={theme} className="bg-base-300">
      <body className={roboto.className}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        >
          <NotificationProvider>
            <AuthorizationProvider>{children}</AuthorizationProvider>
          </NotificationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
