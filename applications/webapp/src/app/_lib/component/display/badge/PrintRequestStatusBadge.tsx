import { Badge } from "@/app/_lib/component/shadcn/badge";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

type Props = React.ComponentProps<typeof Badge> & {
  status: PrintRequestStatus;
};

export function PrintRequestStatusBadge({ status, ...props }: Props) {
  const text = EnumeratedTextUtil.getPrintRequestStatus(status);

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
