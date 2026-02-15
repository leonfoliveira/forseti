import { SnowflakeIcon } from "lucide-react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  frozenLabel: {
    id: "app._lib.component.feedback.freeze-banner.frozen-label",
    defaultMessage: "Frozen",
  },
});

export function FreezeBanner() {
  return (
    <div
      className="flex items-center justify-center gap-1 bg-blue-400 text-sm text-white"
      data-testid="freeze-banner"
    >
      <SnowflakeIcon size={16} />
      <FormattedMessage {...messages.frozenLabel} />
    </div>
  );
}
