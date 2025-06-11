"use client";

import React from "react";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { attachmentService } from "@/app/_composition";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { cls } from "@/app/_util/cls";
import { TableCell } from "@/app/_component/table/table-cell";
import { useContest } from "@/app/_context/contest-context";

export default function ContestProblemsPage() {
  const contest = useContest();

  function onDownload(problem: ProblemPublicResponseDTO) {
    attachmentService.download(problem.description);
  }

  return (
    <div>
      <Table className="table-zebra">
        <TableSection>
          {contest.problems.map((problem) => (
            <TableRow
              key={problem.id}
              className={cls(
                "p-2 hover:bg-base-300 cursor-pointer transition flex justify-between",
              )}
              onClick={() => {
                onDownload(problem);
              }}
              data-testid="problem-row"
            >
              <TableCell data-testid="problem-title">
                {problem.letter}. {problem.title}
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </div>
  );
}
