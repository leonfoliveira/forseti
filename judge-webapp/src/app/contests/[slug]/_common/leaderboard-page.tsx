"use client";

import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { ProblemStatusBadge } from "@/app/_component/badge/problem-status-badge";
import { Table } from "@/app/_component/table/table";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { cls } from "@/app/_util/cls";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { useAuthorization } from "@/store/slices/authorization-slice";

const messages = defineMessages({
  headerScore: {
    id: "app.contests.[slug]._common.leaderboard-page.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.contests.[slug]._common.leaderboard-page.header-penalty",
    defaultMessage: "Penalty",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  leaderboard: ContestLeaderboardResponseDTO;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard }: Props) {
  const authorization = useAuthorization();

  return (
    <div>
      <Table className="table">
        <TableSection head>
          <TableRow>
            <TableCell header></TableCell>
            {problems.map((problem, index) => (
              <TableCell
                key={problem.id}
                header
                align="center"
                className={cls(index % 2 === 0 && "bg-base-200")}
                data-testid="problem-title"
              >
                {problem.letter}
              </TableCell>
            ))}
            <TableCell header align="right" data-testid="header-score">
              <FormattedMessage {...messages.headerScore} />
            </TableCell>
            <TableCell header align="right" data-testid="header-penalty">
              <FormattedMessage {...messages.headerPenalty} />
            </TableCell>
          </TableRow>
        </TableSection>
        <TableSection>
          {leaderboard?.classification.map((member, index) => (
            <TableRow
              key={member.memberId}
              className={cls(
                authorization?.member.id === member.memberId
                  ? "bg-base-200"
                  : "hover:bg-base-100 transition",
              )}
              data-testid="member-row"
            >
              <TableCell data-testid="member-name">{`${index + 1}. ${member.name}`}</TableCell>
              {member.problems.map((problem, index) => (
                <TableCell
                  key={problem.problemId}
                  align="center"
                  className={cls(
                    index % 2 === 0 && "bg-base-200",
                    index % 2 === 0 &&
                      authorization?.member.id === member.memberId &&
                      "bg-base-300",
                  )}
                  data-testid="member-problem"
                >
                  <div className="text-center">
                    <ProblemStatusBadge
                      isAccepted={problem.isAccepted}
                      acceptedAt={problem.acceptedAt}
                      wrongSubmissions={problem.wrongSubmissions}
                    />
                  </div>
                </TableCell>
              ))}
              <TableCell align="right" data-testid="member-score">
                {member.score || ""}
              </TableCell>
              <TableCell align="right" data-testid="member-penalty">
                {member.penalty || ""}
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </div>
  );
}
