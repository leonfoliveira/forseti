import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { Button } from "@/app/_component/form/button";

const messages = defineMessages({
  error: {
    id: "app._component.page.error-page.error",
    defaultMessage: "An error occurred",
  },
  reload: {
    id: "app._component.page.error-page.reload",
    defaultMessage: "Reload",
  },
});

/**
 * ErrorPage component displays an error message and a button to reload the page.
 */
export function ErrorPage() {
  return (
    <div
      className="h-dvh flex justify-center items-center"
      data-testid="error-page"
    >
      <div className="text-center">
        <h1 className="text-6xl mb-5 font-mono" data-testid="error">
          <FormattedMessage {...messages.error} />
        </h1>
        <Button
          label={messages.reload}
          className="btn-soft mt-5"
          onClick={() => window.location.reload()}
          data-testid="reload"
        />
      </div>
    </div>
  );
}
