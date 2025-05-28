"use client";

import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastBar } from "@/app/_component/toast/toast-bar";
import { cls } from "@/app/_util/cls";
import { useTheme } from "@/app/_util/theme-hook";
import { AlertProvider } from "@/app/_component/alert/alert-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();

  return (
    <html lang="en" data-theme={theme} className="bg-base-300">
      <body className={cls(geistSans.variable, geistMono.variable)}>
        {children}
        <ToastBar />
        <AlertProvider />
      </body>
    </html>
  );
}
