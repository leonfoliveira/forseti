"use client";

import React, { useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { cls } from "@/app/_util/cls";
import { useTranslations } from "next-intl";
import { ProblemStatusBadge } from "@/app/contests/[slug]/(dashboard)/_component/problem-status-badge";
import { useLoadableState } from "@/app/_util/loadable-state";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { contestService } from "@/app/_composition";
import { useContest } from "@/app/_context/contest-context";
import { Spinner } from "@/app/_component/spinner";
import { useToast } from "@/app/_context/toast-context";
import { handleError } from "@/app/_util/error-handler";

export function ContestLeaderboardPage() {
  const contest = useContest();
  const t = useTranslations("contests.[slug].leaderboard");

  const leaderboardState = useLoadableState<ContestLeaderboardResponseDTO>();
  const toast = useToast();

  useEffect(() => {
    async function loadLeaderboard() {
      leaderboardState.start();
      try {
        const data = await contestService.findContestLeaderboardById(
          contest.id,
        );
        leaderboardState.finish(data);
      } catch (error) {
        leaderboardState.fail(error);
        handleError(error, {
          default: () => toast.error(t("load-error")),
        });
      }
    }

    loadLeaderboard();
  }, []);

  const problemsLength = contest.problems.length;

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
          {leaderboardState.data?.classification.map((member, index) => (
            <TableRow key={member.memberId} data-testid="member">
              <TableCell data-testid="member-name">{`${index + 1}. ${member.name}`}</TableCell>
              {member.problems.map((problem, index) => (
                <TableCell
                  key={problem.problemId}
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
      {leaderboardState.isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner data-testid="leaderboard:spinner" />
        </div>
      )}
    </div>
  );
}
