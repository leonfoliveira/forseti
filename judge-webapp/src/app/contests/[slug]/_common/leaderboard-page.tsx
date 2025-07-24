"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { cls } from "@/app/_util/cls";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_context/authorization-context";
import { ProblemStatusBadge } from "@/app/contests/[slug]/_component/badge/problem-status-badge";
import { useContest } from "@/app/contests/[slug]/context/contest-context";

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage() {
  const { authorization } = useAuthorization();
  const { contest, leaderboard } = useContest();

  const t = useTranslations("contests.[slug]._common.leaderboard-page");

  return (
    <div>
      <Table className="table">
        <TableSection head>
          <TableRow>
            <TableCell header></TableCell>
            {contest.problems.map((problem, index) => (
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
            <TableCell header align="right">
              Score
            </TableCell>
            <TableCell header align="right">
              {t("header-penalty")}
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
              <TableCell align="right">{member.score || ""}</TableCell>
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
