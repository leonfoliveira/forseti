"use client";

import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastBar } from "@/app/_component/toast/toast-bar";
import { cls } from "@/app/_util/cls";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cls("bg-gray-100", geistSans.variable, geistMono.variable)}
      >
        {children}
        <ToastBar />
      </body>
    </html>
  );
}
