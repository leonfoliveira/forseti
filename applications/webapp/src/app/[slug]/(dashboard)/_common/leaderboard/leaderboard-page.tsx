"use client";

import { ArrowDown01Icon, AwardIcon } from "lucide-react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/problem-letter-badge";
import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/problem-status-badge";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { cn } from "@/app/_lib/util/cn";
import { useAppSelector } from "@/app/_store/store";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.page-title",
    defaultMessage: "Forseti - Leaderboard",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.page-description",
    defaultMessage: "View contest leaderboard and rankings.",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerScore: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-penalty",
    defaultMessage: "Penalty",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.empty",
    defaultMessage: "No contestants yet",
  },
  rulesExplanation: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.rules-explanation",
    defaultMessage:
      "Rankings are determined by: 1) Total problems solved (more is better); 2) Total penalty time (less is better); 3) Time of accepted submissions (earlier is better); 4) Name (alphabetical). Penalty includes submission time plus 20 minutes for each wrong answer before acceptance.",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  leaderboard: LeaderboardResponseDTO;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard }: Props) {
  const session = useAppSelector((state) => state.session);

  function getMedal(index: number) {
    if (index >= 12) {
      return index + 1;
    }
    const color = [
      "text-yellow-400 fill-yellow-400",
      "text-gray-300 fill-gray-300",
      "text-yellow-600 fill-yellow-600",
    ][Math.floor(index / 4)];
    return (
      <>
        <AwardIcon
          className={cn("fill-foreground inline h-5", color)}
          strokeWidth={3}
        />
        {index + 1}
      </>
    );
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <Card className="my-5">
        <CardContent>
          <Table data-testid="leaderboard-table" className="border-b-1">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDown01Icon size={16} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerContestant} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerScore} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerPenalty} />
                </TableHead>
                {problems.map((problem) => (
                  <TableHead key={problem.id} className="text-center">
                    <ProblemLetterBadge problem={problem} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.members.map((member, index) => (
                <TableRow
                  key={member.id}
                  className={cn(
                    member.id === session?.member.id && "bg-primary-50",
                  )}
                  data-testid="leaderboard-member-row"
                >
                  <TableCell data-testid="member-rank">
                    {getMedal(index)}
                  </TableCell>
                  <TableCell data-testid="member-name">{member.name}</TableCell>
                  <TableCell data-testid="member-score">
                    {member.score}
                  </TableCell>
                  <TableCell data-testid="member-penalty">
                    {member.penalty}
                  </TableCell>
                  {member.problems.map((problem) => (
                    <TableCell
                      key={problem.id}
                      className="text-center"
                      data-testid="member-problem"
                    >
                      <ProblemStatusBadge
                        isAccepted={problem.isAccepted}
                        acceptedAt={problem.acceptedAt}
                        wrongSubmissions={problem.wrongSubmissions}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Alert className="bg-muted mt-7 py-2">
            <AlertDescription className="text-xs">
              <FormattedMessage {...messages.rulesExplanation} />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
