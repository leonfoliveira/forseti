"use client";

import Image from "next/image";
import React from "react";

import { Metadata } from "@/app/_lib/component/metadata";
import { defineMessages } from "@/i18n/message";

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

/**
 * The home page of the web application.
 * Displays the app logo.
 */
export default function HomePage() {
  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex h-screen items-center justify-center">
        <Image
          src="/icon.png"
          alt="Logo of forseti"
          width={300}
          height={300}
          data-testid="logo-image"
        />
      </div>
    </>
  );
}
