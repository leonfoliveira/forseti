"use client";

import { Roboto } from "next/font/google";

import { HeroUIProvider, ToastProvider } from "@/app/_lib/heroui-wrapper";
import { cls } from "@/app/_lib/util/cls";
import { useTheme } from "@/app/_lib/util/theme-hook";

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
