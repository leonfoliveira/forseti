"use client";

import { Roboto } from "next/font/google";
import clsx from "clsx";

import { Toaster } from "@/app/_lib/component/shadcn/sonner";
import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { ThemeProvider } from "@/app/_lib/provider/ThemeProvider";

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
  return (
    <html>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/config.js" />
      </head>
      <body className={clsx(roboto.className, "bg-card")}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
