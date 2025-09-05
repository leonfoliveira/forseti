"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { Roboto } from "next/font/google";

import { cls } from "@/lib/util/cls";
import { useTheme } from "@/lib/util/theme-hook";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export function Html({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html className={cls("bg-content3", theme)}>
      <body className={roboto.className}>
        <HeroUIProvider>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}
