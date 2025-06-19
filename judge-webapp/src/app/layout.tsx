import React from "react";
import "./globals.css";
import { Html } from "@/app/_html";
import { getIntlConfig } from "@/i18n/request";
import { Metadata } from "next";
import { config } from "@/app/_config";

export const metadata: Metadata = {
  title: "Judge",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getIntlConfig();

  return (
    <Html locale={locale} messages={messages as any}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <footer className="footer footer-center bg-base-100 text-base-content/50 text-xs py-1 border-t border-solid border-base-300">
          <aside>
            <p>
              Judge {config.VERSION} | by{" "}
              <a href="https://github.com/leonfoliveira" target="_blank">
                @leonfoliveira
              </a>
            </p>
          </aside>
        </footer>
      </div>
    </Html>
  );
}
