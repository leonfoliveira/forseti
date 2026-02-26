"use client";

import { ClockAlertIcon } from "lucide-react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.wait-page.page-title",
    defaultMessage: "Forseti - Waiting for the contest to start",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.wait-page.page-description",
    defaultMessage:
      "Waiting page displayed when the contest has not started yet.",
  },
  description: {
    id: "app.[slug].(dashboard)._common.wait-page.description",
    defaultMessage:
      "The contest has not started yet. Please wait for the contest to start.",
  },
  startAt: {
    id: "app.[slug].(dashboard)._common.wait-page.start-at",
    defaultMessage: "Starts in",
  },
  languages: {
    id: "app.[slug].(dashboard)._common.wait-page.languages",
    defaultMessage: "Supported languages",
  },
  reload: {
    id: "app.[slug].(dashboard)._common.wait-page.reload",
    defaultMessage:
      "The page will automatically reload when the contest starts. You can also reload manually.",
  },
});

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage() {
  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div
        className="flex flex-1 items-center justify-center"
        data-testid="wait-page"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <ClockAlertIcon size={100} className="mb-5" />
          <p>
            <FormattedMessage {...messages.description} />
          </p>
          <p>
            <FormattedMessage {...messages.reload} />
          </p>
        </div>
      </div>
    </Page>
  );
}
