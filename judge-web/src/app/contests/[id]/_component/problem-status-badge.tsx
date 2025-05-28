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
      <Badge className="badge-success">
        AC
        {wrongSubmissions > 0 && `+${wrongSubmissions}`}
      </Badge>
    );
  } else if (wrongSubmissions > 0) {
    return <Badge className="badge-secondary">+{wrongSubmissions}</Badge>;
  } else {
    return null;
  }
}
