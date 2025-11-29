"use client";

import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.forbidden.description",
    defaultMessage: "You do not have permission to access this page.",
  },
});

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        404
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
    </div>
  );
}
