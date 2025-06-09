"use client";

import React from "react";
import { useContest } from "@/app/contests/[slug]/_context";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { attachmentService } from "@/app/_composition";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { cls } from "@/app/_util/cls";
import { TableCell } from "@/app/_component/table/table-cell";

export default function ContestProblemsPage() {
  const { contest } = useContest();

  function onDownload(problem: ProblemPublicResponseDTO) {
    attachmentService.download(problem.description);
  }

  return (
    <div>
      <Table className="table-zebra">
        <TableSection>
          {contest.problems.map((problem, index) => (
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
