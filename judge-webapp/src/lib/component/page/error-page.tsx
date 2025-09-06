import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import React from "react";

import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { Button } from "@/lib/heroui-wrapper";

const messages = defineMessages({
  description: {
    id: "lib.component.page.error-page.description",
    defaultMessage: "An unexpected error has occurred.",
  },
  reload: {
    id: "lib.component.page.error-page.reload",
    defaultMessage: "Reload the page",
  },
});

export function ErrorPage() {
  return (
    <div className="h-dvh flex flex-col justify-center items-center">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
      <Button
        color="primary"
        className="mt-10"
        onPress={() => window.location.reload()}
        data-testid="reload"
      >
        <ArrowPathRoundedSquareIcon width={20} />
        <FormattedMessage {...messages.reload} />
      </Button>
    </div>
  );
}
