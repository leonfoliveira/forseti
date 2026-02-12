import React from "react";

import { Badge } from "@/app/_lib/component/shadcn/badge";
import { cn } from "@/app/_lib/util/cn";
import { useAppSelector } from "@/app/_store/store";

type Props = React.ComponentProps<typeof Badge> & {
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
};

/**
 * Displays a badge component styled according to the problem resolution status.
 * If the problem is accepted, it shows the time taken to solve it since the contest started,
 * along with the number of wrong submissions if any.
 * If the problem is not accepted but has wrong submissions, it shows the count of wrong submissions.
 * If there are no submissions, it returns null (no badge displayed).
 */
export function ProblemStatusBadge({
  isAccepted,
  acceptedAt,
  wrongSubmissions,
  ...props
}: Props) {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);

  if (isAccepted && acceptedAt) {
    const diffMs = Math.max(
      0,
      new Date(acceptedAt).getTime() -
        new Date(contestMetadata.startAt).getTime(),
    );
    return (
      <Badge
        data-testid="badge-accepted"
        variant="ghost"
        {...props}
        className="text-green-600"
      >
        {Math.floor(diffMs / 1000 / 60)}
        {wrongSubmissions > 0 && ` (+${wrongSubmissions})`}
      </Badge>
    );
  } else if (wrongSubmissions > 0) {
    return (
      <Badge
        data-testid="badge-rejected"
        variant="ghost"
        {...props}
        className="text-red-600"
      >
        {`+${wrongSubmissions}`}
      </Badge>
    );
  } else {
    return null;
  }
}
