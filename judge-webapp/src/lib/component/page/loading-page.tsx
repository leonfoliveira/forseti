import { CircularProgress } from "@heroui/react";
import React from "react";

import { defineMessages } from "@/i18n/message";
import { useIntl } from "@/lib/util/intl-hook";

const messages = defineMessages({
  label: {
    id: "lib.component.page.loading-page.label",
    defaultMessage: "Loading",
  },
});

/**
 * LoadingPage component displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  const intl = useIntl();

  return (
    <div className="h-dvh flex justify-center items-center">
      <CircularProgress
        data-testid="spinner"
        size="lg"
        aria-label={intl.formatMessageRaw(messages.label)}
      />
    </div>
  );
}
