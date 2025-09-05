import { Chip, ChipProps } from "@heroui/react";
import React from "react";

import { FormattedDuration } from "@/lib/component/format/formatted-duration";
import { useAppSelector } from "@/store/store";

type Props = ChipProps & {
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
};

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
