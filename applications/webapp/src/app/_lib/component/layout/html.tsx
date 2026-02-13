"use client";

import { Roboto } from "next/font/google";

import { Toaster } from "@/app/_lib/component/shadcn/sonner";
import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { useTheme } from "@/app/_lib/hook/theme-hook";
import { cn } from "@/app/_lib/util/cn";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

/**
 * HTML component that wraps the entire web application.
 * Sets up the theme and font for the application.
 * Adds necessary providers.
 */
export function Html({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html className={cn("bg-content3", theme)}>
      <body className={roboto.className}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
