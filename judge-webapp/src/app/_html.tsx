"use client";

import React from "react";
import { useTheme } from "@/app/_util/theme-hook";
import { cls } from "@/app/_util/cls";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthorizationProvider } from "@/app/_component/context/authorization-context";
import { NotificationProvider } from "@/app/_component/context/notification-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      <body className={cls(geistSans.variable, geistMono.variable)}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="GMT"
        >
          <NotificationProvider>
            <AuthorizationProvider>{children}</AuthorizationProvider>
          </NotificationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
