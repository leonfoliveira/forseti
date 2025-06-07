"use client";

import React, { useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { ProblemStatusBadge } from "@/app/contests/[id]/_component/problem-status-badge";
import { attachmentService } from "@/app/_composition";

type Props = {
  contestId: number;
};

export function ContestantContestProblemsPage({ contestId }: Props) {
  const { data: problems, ...findAllProblemsForMemberAction } =
    useFindAllProblemsForMemberAction();

  useEffect(() => {
    async function getProblems() {
      await findAllProblemsForMemberAction.act(contestId);
    }
    getProblems();
  }, []);

  function onDownload(problem: ProblemMemberResponseDTO) {
    attachmentService.download(problem.description);
  }

  if (findAllProblemsForMemberAction.isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Table className="table-zebra">
        <TableSection>
          {problems?.map((problem, index) => (
            <TableRow
              key={problem.id}
              className={cls(
                "hover:bg-base-200 active:bg-base-300 cursor-pointer transition duration-100",
              )}
              onClick={() => {
                onDownload(problem);
              }}
              data-testid="member-problem-row"
            >
              <TableCell data-testid="problem-title">
                {index + 1}. {problem.title}
              </TableCell>
              <TableCell align="right" data-testid="problem-status">
                <ProblemStatusBadge
                  isAccepted={problem.isAccepted}
                  wrongSubmissions={problem.wrongSubmissions}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </div>
  );
}
