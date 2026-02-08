import { Card } from "@/app/_lib/component/base/display/card";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  empty: {
    id: "app.[slug].(dashboard)._common.clarifications.empty-clarification-display.empty",
    defaultMessage: "No clarifications yet",
  },
});

export function EmptyClarificationDisplay() {
  return (
    <Card className="w-full max-w-4xl" data-testid="empty">
      <Card.Body>
        <p className="text-neutral-content text-foreground-400 my-10 text-center">
          <FormattedMessage {...messages.empty} />
        </p>
      </Card.Body>
    </Card>
  );
}
