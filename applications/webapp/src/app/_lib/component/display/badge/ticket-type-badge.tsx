import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { globalMessages } from "@/i18n/global";

type Props = React.ComponentProps<typeof Badge> & {
  type: TicketType;
};

/**
 * Displays a badge representing the type of a ticket. The badge's appearance and text are determined by the ticket type.
 *
 * @param type - The type of the ticket, which determines the badge's appearance and text.
 */
export function TicketTypeBadge({ type, ...props }: Props) {
  const text = <FormattedMessage {...globalMessages.ticketType[type]} />;

  switch (type) {
    case TicketType.SUBMISSION_PRINT:
      return (
        <Badge
          data-testid="badge-submission-print"
          {...props}
          variant="default"
        >
          {text}
        </Badge>
      );
    case TicketType.TECHNICAL_SUPPORT:
      return (
        <Badge data-testid="badge-technical-support" {...props} variant="error">
          {text}
        </Badge>
      );
    case TicketType.NON_TECHNICAL_SUPPORT:
      return (
        <Badge
          data-testid="badge-non-technical-support"
          {...props}
          variant="warning"
        >
          {text}
        </Badge>
      );
  }
}
