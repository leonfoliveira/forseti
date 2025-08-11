import React from "react";

import { Badge } from "@/app/_component/badge/badge";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";

type Props = {
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
};

export function ProblemStatusBadge({
  isAccepted,
  acceptedAt,
  wrongSubmissions,
}: Props) {
  if (isAccepted) {
    return (
      <Badge className="badge-success">
        <FormattedDateTime timestamp={acceptedAt!} />
        {wrongSubmissions > 0 && ` | +${wrongSubmissions}`}
      </Badge>
    );
  } else if (wrongSubmissions > 0) {
    return <Badge className="badge-error">+{wrongSubmissions}</Badge>;
  } else {
    return null;
  }
}
