"use client";

import React, { use, useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { useGetLeaderboardAction } from "@/app/_action/get-leaderboard-action";
import { ProblemStatusBadge } from "@/app/contests/[id]/_component/problem-status-badge";

export default function ContestLeaderboardPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { data: leaderboard, ...getLeaderboardAction } =
    useGetLeaderboardAction();

  useEffect(() => {
    getLeaderboardAction.act(id);
  }, []);

  if (getLeaderboardAction.isLoading || !leaderboard) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  const problemsLength = leaderboard.problems.length;

  return (
    <Table className="table">
      <TableSection head>
        <TableRow>
          <TableCell header></TableCell>
          {leaderboard.problems.map((problem, index) => (
            <TableCell
              key={problem.id}
              header
              align="center"
              className={cls(index % 2 === 0 && "bg-base-200")}
              data-testid="problem-title"
            >
              {index + 1}. {problem.title}
            </TableCell>
          ))}
          <TableCell
            header
            align="right"
            className={cls(problemsLength % 2 === 0 && "bg-base-200")}
          >
            Penalty
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {leaderboard.members.map((member, index) => (
          <TableRow key={member.id} data-testid="member">
            <TableCell data-testid="member-name">{`${index + 1}. ${member.name}`}</TableCell>
            {member.problems.map((problem, index) => (
              <TableCell
                key={problem.id}
                align="center"
                className={cls(index % 2 === 0 && "bg-base-200")}
                data-testid="member-problem"
              >
                <div className="text-center">
                  <ProblemStatusBadge
                    isAccepted={problem.isAccepted}
                    wrongSubmissions={problem.wrongSubmissions}
                  />
                </div>
              </TableCell>
            ))}
            <TableCell
              align="right"
              className={cls(problemsLength % 2 === 0 && "bg-base-200")}
              data-testid="member-penalty"
            >
              {member.penalty || ""}
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
