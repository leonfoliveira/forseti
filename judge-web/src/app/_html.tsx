"use client";

import React from "react";
import { useTheme } from "@/app/_util/theme-hook";
import { cls } from "@/app/_util/cls";
import { NextIntlClientProvider } from "next-intl";
import { AlertProvider } from "@/app/_component/alert/alert-provider";
import { ToastProvider } from "@/app/_component/toast/toast-provider";
import { Geist, Geist_Mono } from "next/font/google";

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AlertProvider>
            <ToastProvider>{children}</ToastProvider>
          </AlertProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
