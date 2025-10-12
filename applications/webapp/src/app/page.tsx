"use client";

import Image from "next/image";
import React from "react";

import { defineMessages } from "@/i18n/message";
import { Metadata } from "@/lib/component/metadata";

const messages = defineMessages({
  pageTitle: {
    id: "app.page.page-title",
    defaultMessage: "Forseti",
  },
  pageDescription: {
    id: "app.page.page-description",
    defaultMessage: "Forseti application.",
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
        <Image src="/icon.jpg" alt="Logo of forseti" width={300} height={300} />
      </div>
    </>
  );
}
