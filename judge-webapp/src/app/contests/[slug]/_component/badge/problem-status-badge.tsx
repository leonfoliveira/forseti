import { Badge } from "@/app/_component/badge";
import React from "react";
import { TimestampDisplay } from "@/app/_component/timestamp-display";

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
      <Badge className="badge-success" data-testid="badge:ac">
        <TimestampDisplay timestamp={acceptedAt!} />
        {wrongSubmissions > 0 && ` | +${wrongSubmissions}`}
      </Badge>
    );
  } else if (wrongSubmissions > 0) {
    return (
      <Badge className="badge-error" data-testid="badge:wa">
        +{wrongSubmissions}
      </Badge>
    );
  } else {
    return null;
  }
}
