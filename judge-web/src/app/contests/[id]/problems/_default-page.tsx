"use client";

import React, { useEffect } from "react";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { attachmentService } from "@/app/_composition";

type Props = {
  contestId: number;
};

export function DefaultContestProblemsPage({ contestId }: Props) {
  const { data: problems, ...findAllProblemsAction } =
    useFindAllProblemsAction();

  useEffect(() => {
    async function getProblems() {
      await findAllProblemsAction.act(contestId);
    }
    getProblems();
  }, []);

  function onDownload(problem: ProblemPublicResponseDTO) {
    attachmentService.download(problem.description);
  }

  if (findAllProblemsAction.isLoading) {
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
                "p-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition flex justify-between",
                index % 2 === 1 && "bg-gray-50",
              )}
              onClick={() => {
                onDownload(problem);
              }}
              data-testid="problem-row"
            >
              <TableCell data-testid="problem-title">
                {index + 1}. {problem.title}
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </div>
  );
}
