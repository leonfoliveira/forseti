"use client";

import { ArrowDown01, Award } from "lucide-react";
import React from "react";

import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/problem-status-badge";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
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
    id: "app.[slug].(dashboard)._common.leaderboard-page.page-title",
    defaultMessage: "Forseti - Leaderboard",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.page-description",
    defaultMessage: "View contest leaderboard and rankings.",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerScore: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-penalty",
    defaultMessage: "Penalty",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.empty",
    defaultMessage: "No contestants yet",
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
    const color = ["text-yellow-400", "text-gray-300", "text-yellow-600"][
      Math.floor(index / 4)
    ];
    return (
      <>
        <Award className={cn("inline h-5", color)} strokeWidth={3} />
        {index + 1}
      </>
    );
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <Card>
        <CardContent>
          <Table>
            <TableHeader className="bg-content2">
              <TableRow>
                <TableHead>
                  <p>
                    <ArrowDown01
                      size={16}
                      className="inline"
                      data-icon="inline-start"
                    />
                  </p>
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
                    {problem.letter}
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
        </CardContent>
      </Card>
    </Page>
  );
}
