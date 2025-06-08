"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { cls } from "@/app/_util/cls";
import { useTranslations } from "next-intl";
import { useContest } from "@/app/contests/[slug]/_context";
import { ProblemStatusBadge } from "@/app/contests/[slug]/_component/problem-status-badge";

export default function ContestLeaderboardPage() {
  const { contest } = useContest();
  const t = useTranslations("contests.[slug].leaderboard");

  const problemsLength = contest.problems.length;

  return (
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
              {index + 1}. {problem.title}
            </TableCell>
          ))}
          <TableCell
            header
            align="right"
            className={cls(problemsLength % 2 === 0 && "bg-base-200")}
          >
            {t("header-penalty")}
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {contest.members.map((member, index) => (
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
