"use client";

import React, { use, useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { Badge } from "@/app/_component/badge";
import { useGetLeaderboardAction } from "@/app/_action/get-leaderboard-action";

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
    <Table>
      <TableSection>
        <TableRow>
          <TableCell header></TableCell>
          {leaderboard.problems.map((problem, index) => (
            <TableCell
              key={problem.id}
              header
              align="center"
              className={cls(index % 2 === 0 && "bg-gray-50")}
            >
              {problem.title}
            </TableCell>
          ))}
          <TableCell
            header
            align="right"
            className={cls(problemsLength % 2 === 0 && "bg-gray-50")}
          >
            Penalty
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {leaderboard.members.map((member, index) => (
          <TableRow key={member.id} className="h-15">
            <TableCell>{`${index + 1}. ${member.name}`}</TableCell>
            {member.problems.map((problem, index) => (
              <TableCell
                key={problem.id}
                align="center"
                className={cls(index % 2 === 0 && "bg-gray-50")}
              >
                <div className="text-center">
                  {problem.isAccepted && (
                    <p className="h-[1.2em] text-xl font-semibold text-green-500">
                      <Badge variant="success">
                        AC
                        {problem.wrongSubmissions > 0 &&
                          `+${problem.wrongSubmissions}`}
                      </Badge>
                    </p>
                  )}
                  {!problem.isAccepted && problem.wrongSubmissions > 0 && (
                    <p className="text-sm font-semibold text-red-500">
                      <Badge variant="danger">
                        +{problem.wrongSubmissions}
                      </Badge>
                    </p>
                  )}
                </div>
              </TableCell>
            ))}
            <TableCell
              align="right"
              className={cls(problemsLength % 2 === 0 && "bg-gray-50")}
            >
              {member.penalty || ""}
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
