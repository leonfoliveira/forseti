import { Badge } from "@/app/_component/badge";
import React from "react";

type Props = {
  isAccepted: boolean;
  wrongSubmissions: number;
};

export function ProblemStatusBadge(props: Props) {
  const { isAccepted, wrongSubmissions } = props;

  if (isAccepted) {
    return (
      <Badge className="badge-success" data-testid="badge:ac">
        AC
        {wrongSubmissions > 0 && `+${wrongSubmissions}`}
      </Badge>
    );
  } else if (wrongSubmissions > 0) {
    return (
      <Badge className="badge-secondary" data-testid="badge:wa">
        +{wrongSubmissions}
      </Badge>
    );
  } else {
    return null;
  }
}
