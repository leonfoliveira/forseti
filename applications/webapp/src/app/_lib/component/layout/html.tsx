"use client";

import { Roboto } from "next/font/google";

import { Toaster } from "@/app/_lib/component/shadcn/sonner";
import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { ThemeProvider } from "@/app/_lib/provider/theme-provider";

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
    <html className="bg-content3">
      <body className={roboto.className}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
