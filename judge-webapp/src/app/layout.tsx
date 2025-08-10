"use client";

import React from "react";
import "./globals.css";
import { env } from "@/config/env";
import { useTheme } from "@/app/_util/theme-hook";
import { Roboto } from "next/font/google";
import { NotificationProvider } from "@/app/_context/notification-context";
import { AuthorizationProvider } from "@/app/_context/authorization-context";
import { IntlProvider } from "react-intl";
import enUS from "@/i18n/messages/en-US.json";
import ptBR from "@/i18n/messages/pt-BR.json";
import { Footer } from "./_component/footer";
import { StoreProvider } from "@/store/store-provider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();

  const messages =
    {
      "en-US": enUS,
      "pt-BR": ptBR,
    }[env.LOCALE] || enUS;

  return (
    <html lang={env.LOCALE} data-theme={theme} className="bg-base-300">
      <body className={roboto.className}>
        <IntlProvider messages={messages} locale={env.LOCALE}>
          <StoreProvider>
            <NotificationProvider>
              <AuthorizationProvider>
                <div className="flex flex-col w-screen h-screen">
                  <div className="flex-1">{children}</div>
                  <Footer />
                </div>
              </AuthorizationProvider>
            </NotificationProvider>
          </StoreProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
