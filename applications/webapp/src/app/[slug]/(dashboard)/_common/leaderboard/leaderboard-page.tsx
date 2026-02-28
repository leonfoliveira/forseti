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
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";
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
  unofficial: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unofficial",
    defaultMessage: "(Unofficial)",
  },
});

type Props = {
  problems: ProblemResponseDTO[];
  leaderboard: LeaderboardResponseDTO;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard }: Props) {
  const session = useAppSelector((state) => state.session);

  function getMedal(rank: number) {
    if (rank > 12) {
      return rank;
    }
    const color = [
      "text-yellow-400 fill-yellow-400",
      "text-gray-300 fill-gray-300",
      "text-yellow-600 fill-yellow-600",
    ][Math.floor((rank - 1) / 4)];
    return (
      <>
        <AwardIcon
          className={cn("fill-foreground inline h-5", color)}
          strokeWidth={3}
        />
        {rank}
      </>
    );
  }

  const ranks: Record<string, number> = {};
  let currentRank = 1;
  for (let i = 0; i < leaderboard.rows.length; i++) {
    if (leaderboard.rows[i].memberType !== MemberType.CONTESTANT) {
      continue;
    }
    ranks[leaderboard.rows[i].memberId] = currentRank;
    currentRank++;
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
              {leaderboard.rows.map((row) => (
                <TableRow
                  key={row.memberId}
                  className={cn(
                    row.memberId === session?.member.id && "bg-muted/50",
                  )}
                  data-testid="leaderboard-member-row"
                >
                  <TableCell data-testid="member-rank">
                    {ranks[row.memberId] !== undefined &&
                      getMedal(ranks[row.memberId])}
                  </TableCell>
                  <TableCell
                    className={cn(
                      row.memberType !== MemberType.CONTESTANT &&
                        "text-muted-foreground",
                    )}
                    data-testid="member-name"
                  >
                    {row.memberType !== MemberType.CONTESTANT && (
                      <FormattedMessage {...messages.unofficial} />
                    )}{" "}
                    {row.memberName}
                  </TableCell>
                  <TableCell data-testid="member-score">{row.score}</TableCell>
                  <TableCell data-testid="member-penalty">
                    {row.penalty}
                  </TableCell>
                  {row.cells.map((cell) => (
                    <TableCell
                      key={cell.problemId}
                      className="text-center"
                      data-testid="member-problem"
                    >
                      <ProblemStatusBadge
                        isAccepted={cell.isAccepted}
                        acceptedAt={cell.acceptedAt}
                        wrongSubmissions={cell.wrongSubmissions}
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
