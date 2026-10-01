"use client";

import { ArrowDown01Icon, AwardIcon } from "lucide-react";
import React from "react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/ProblemLetterBadge";
import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/ProblemStatusBadge";
import { Page } from "@/app/_lib/component/page/Page";
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
import { useAppSelector } from "@/app/_store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { clsx } from "clsx";

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
          className={clsx("fill-foreground inline h-5", color)}
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
    <Page
      title={"Forseti - Leaderboard"}
      description={"Leaderboard of the contest."}
    >
      <Card className="my-5">
        <CardContent>
          <Table data-testid="leaderboard-table" className="border-b">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDown01Icon size={16} />
                </TableHead>
                <TableHead>Contestant</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Penalty</TableHead>
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
                  className={clsx(
                    row.memberId === session?.member.id && "font-bold",
                  )}
                  data-testid="leaderboard-member-row"
                >
                  <TableCell data-testid="member-rank">
                    {ranks[row.memberId] !== undefined &&
                      getMedal(ranks[row.memberId])}
                  </TableCell>
                  <TableCell data-testid="member-name">
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
              {
                "Rankings are determined by: 1) Total problems solved (more is better); 2) Total penalty time (less is better); 3) Time of accepted submissions (earlier is better); 4) Name (alphabetical). Penalty includes submission time plus 20 minutes for each wrong answer before acceptance."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
