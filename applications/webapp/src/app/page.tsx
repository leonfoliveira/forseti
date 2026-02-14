"use client";

import Image from "next/image";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Theme, useTheme } from "@/app/_lib/provider/theme-provider";
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
  welcomeTitle: {
    id: "app.page.welcome-title",
    defaultMessage: "Welcome to Forseti Judge",
  },
  contestAccessInfo: {
    id: "app.page.contest-access-info",
    defaultMessage:
      "To access a contest, please use the correct contest URL format:",
  },
  urlFormat: {
    id: "app.page.url-format",
    defaultMessage: "/'{contest-slug'}",
  },
  urlFormatDescription: {
    id: "app.page.url-format-description",
    defaultMessage:
      "Replace '{contest-slug'} with your specific contest identifier.",
  },
  contactAdmin: {
    id: "app.page.contact-admin",
    defaultMessage:
      "If you don't have a contest URL, please contact your contest administrator.",
  },
});

/**
 * The home page of the web application.
 * Displays the app logo and instructions for accessing contests.
 */
export default function HomePage() {
  const { theme } = useTheme();

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <Image
            src={theme === Theme.DARK ? "/icon-dark.png" : "/icon-light.png"}
            alt="Logo of forseti"
            width={300}
            height={300}
            data-testid="logo-image"
            className="mx-auto mb-8"
          />

          <div className="max-w-2xl space-y-6">
            <h1
              className="text-primary text-4xl font-bold"
              data-testid="welcome-title"
            >
              <FormattedMessage {...messages.welcomeTitle} />
            </h1>

            <div className="space-y-4 text-lg">
              <p
                className="text-base-content"
                data-testid="contest-access-info"
              >
                <FormattedMessage {...messages.contestAccessInfo} />
              </p>

              <div className="bg-base-200 rounded-lg p-4">
                <code
                  className="text-primary font-mono text-xl"
                  data-testid="url-format"
                >
                  <FormattedMessage {...messages.urlFormat} />
                </code>
              </div>

              <p
                className="text-base-content/70 text-sm"
                data-testid="url-format-description"
              >
                <FormattedMessage {...messages.urlFormatDescription} />
              </p>

              <p
                className="text-base-content text-base"
                data-testid="contact-admin"
              >
                <FormattedMessage {...messages.contactAdmin} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
