"use client";

import Image from "next/image";
import React from "react";

import { defineMessages } from "@/i18n/message";
import { Metadata } from "@/lib/component/metadata";

const messages = defineMessages({
  pageTitle: {
    id: "app.page.page-title",
    defaultMessage: "Judge",
  },
  pageDescription: {
    id: "app.page.page-description",
    defaultMessage: "Judge application.",
  },
});

export default function HomePage() {
  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="h-screen flex justify-center items-center">
        <Image src="/favicon.ico" alt="Logo of judge" width={75} height={75} />
      </div>
    </>
  );
}
