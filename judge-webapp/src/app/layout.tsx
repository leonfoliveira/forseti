"use client";

import React from "react";
import "./globals.css";
import { env } from "@/config/env";
import { useTheme } from "./_util/theme-hook";
import { Roboto } from "next/font/google";
import { NotificationProvider } from "./_context/notification-context";
import { AuthorizationProvider } from "./_context/authorization-context";
import { IntlProvider, FormattedMessage, defineMessages } from "react-intl";
import enUS from "@/i18n/messages/en-US.json";
import ptBR from "@/i18n/messages/pt-BR.json";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const layoutMessages = defineMessages({
  footerText: {
    id: "layout.footerText",
    defaultMessage: "Judge {version} | by {author}",
  },
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
          <NotificationProvider>
            <AuthorizationProvider>
              <div className="flex flex-col w-screen h-screen">
                <div className="flex-1">{children}</div>
                <footer className="footer footer-center bg-base-100 text-base-content/50 text-xs py-1 border-t border-solid border-base-300">
                  <p data-testid="footer">
                    <FormattedMessage
                      {...layoutMessages.footerText}
                      values={{
                        version: env.VERSION,
                        author: (
                          <a
                            href="https://github.com/leonfoliveira"
                            target="_blank"
                            data-testid="github-link"
                          >
                            @leonfoliveira
                          </a>
                        ),
                      }}
                    />
                  </p>
                </footer>
              </div>
            </AuthorizationProvider>
          </NotificationProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
