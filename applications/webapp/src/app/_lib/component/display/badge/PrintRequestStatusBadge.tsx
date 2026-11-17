import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

type Props = React.ComponentProps<typeof Badge> & {
  status: PrintRequestStatus;
};

export function PrintRequestStatusBadge({ status, ...props }: Props) {
  const text = <FormattedMessage id={I18nUtil.getPrintRequestStatus(status)} />;

  switch (status) {
    case PrintRequestStatus.PENDING:
      return (
        <Badge data-testid="badge-pending" {...props} variant="outline">
          {text}
        </Badge>
      );
    case PrintRequestStatus.COMPLETED:
      return (
        <Badge data-testid="badge-completed" {...props} variant="success">
          {text}
        </Badge>
      );
    case PrintRequestStatus.REFUSED:
      return (
        <Badge data-testid="badge-refused" {...props} variant="destructive">
          {text}
        </Badge>
      );
  }
}
