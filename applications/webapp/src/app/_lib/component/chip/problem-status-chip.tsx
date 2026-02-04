import React from "react";

import { Chip, ChipProps } from "@/app/_lib/component/base/display/chip";
import { FormattedDuration } from "@/app/_lib/component/format/formatted-duration";
import { useAppSelector } from "@/app/_store/store";

type Props = ChipProps & {
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
};

/**
 * Displays a chip component styled according to the problem resolution status.
 * If the problem is accepted, it shows the time taken to solve it since the contest started,
 * along with the number of wrong submissions if any.
 * If the problem is not accepted but has wrong submissions, it shows the count of wrong submissions.
 * If there are no submissions, it returns null (no chip displayed).
 */
export function ProblemStatusChip({
  isAccepted,
  acceptedAt,
  wrongSubmissions,
  ...props
}: Props) {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);

  if (isAccepted && acceptedAt) {
    const diff =
      new Date(acceptedAt).getTime() -
      new Date(contestMetadata.startAt).getTime();
    return (
      <Chip data-testid="chip-accepted" {...props} color="success">
        <FormattedDuration ms={diff} />
        {wrongSubmissions > 0 && ` +${wrongSubmissions}`}
      </Chip>
    );
  } else if (wrongSubmissions > 0) {
    return (
      <Chip data-testid="chip-rejected" {...props} color="danger">
        +{wrongSubmissions}
      </Chip>
    );
  } else {
    return null;
  }
}
