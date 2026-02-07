import React from "react";

import { CircularProgress } from "@/app/_lib/component/base/feedback/circular-progress";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  label: {
    id: "app._lib.component.page.loading-page.label",
    defaultMessage: "Loading",
  },
});

/**
 * Displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  const intl = useIntl();

  return (
    <div className="flex h-dvh items-center justify-center">
      <CircularProgress
        data-testid="spinner"
        size="lg"
        aria-label={intl.formatMessageRaw(messages.label)}
      />
    </div>
  );
}
