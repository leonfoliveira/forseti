import React from "react";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

type Props = React.ComponentProps<typeof Badge> & {
  status: ContestStatus;
};

/**
 * Displays a badge component styled according to the contest status.
 */
export function ContestStatusBadge({ status, ...props }: Props) {
  const text = <FormattedMessage id={I18nUtil.getContestStatus(status)} />;

  switch (status) {
    case ContestStatus.IN_PROGRESS:
      return (
        <Badge data-testid="badge-in-progress" {...props} variant="success">
          {text}
        </Badge>
      );
    case ContestStatus.ENDED:
      return (
        <Badge data-testid="badge-ended" {...props} variant="destructive">
          {text}
        </Badge>
      );
    case ContestStatus.NOT_STARTED:
      return (
        <Badge data-testid="badge-not-started" {...props} variant="outline">
          {text}
        </Badge>
      );
  }
}
