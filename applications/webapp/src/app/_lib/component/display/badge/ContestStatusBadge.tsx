import React from "react";

import { Badge } from "@/app/_lib/component/shadcn/badge";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";

type Props = React.ComponentProps<typeof Badge> & {
  status: ContestStatus;
};

/**
 * Displays a badge component styled according to the contest status.
 */
export function ContestStatusBadge({ status, ...props }: Props) {
  const text = {
    [ContestStatus.IN_PROGRESS]: "In Progress",
    [ContestStatus.ENDED]: "Ended",
    [ContestStatus.NOT_STARTED]: "Not Started",
  }[status];

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
