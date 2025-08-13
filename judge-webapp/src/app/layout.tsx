"use client";

import "./globals.css";

import { Roboto } from "next/font/google";
import React from "react";
import { IntlProvider } from "react-intl";

import { AuthorizationProvider } from "@/app/_context/authorization-provider";
import { useTheme } from "@/app/_util/theme-hook";
import { env } from "@/config/env";
import enUS from "@/i18n/messages/en-US.json";
import ptBR from "@/i18n/messages/pt-BR.json";
import { Footer } from "@/lib/component/footer";
import { AlertBox } from "@/lib/component/notification/alert-box";
import { ToastBox } from "@/lib/component/notification/toast-box";
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
            <AuthorizationProvider>
              <div className="flex flex-col w-screen h-screen">
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
            </AuthorizationProvider>
            <AlertBox />
            <ToastBox />
          </StoreProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
