"use client";

import React, { use, useEffect } from "react";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { ProblemStatusBadge } from "@/app/contests/[id]/_component/problem-status-badge";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { attachmentService } from "@/app/_composition";

export default function ContestProblemsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const authorization = useAuthorization();
  const { data: problems, ...findAllProblemsAction } =
    useFindAllProblemsAction();
  const { data: memberProblems, ...findAllProblemsForMemberAction } =
    useFindAllProblemsForMemberAction();

  const isContestant = authorization?.member.type === MemberType.CONTESTANT;

  useEffect(() => {
    async function getProblems() {
      if (isContestant) {
        await findAllProblemsForMemberAction.act(id);
      } else {
        await findAllProblemsAction.act(id);
      }
    }
    getProblems();
  }, [isContestant]);

  function onDownload(
    problem: ProblemMemberResponseDTO | ProblemPublicResponseDTO,
  ) {
    attachmentService.download(problem.description);
  }

  if (
    findAllProblemsAction.isLoading ||
    findAllProblemsForMemberAction.isLoading
  ) {
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
          {isContestant
            ? memberProblems?.map((problem, index) => (
                <TableRow
                  key={problem.id}
                  className={cls(
                    "hover:bg-base-200 active:bg-base-300 cursor-pointer transition duration-100",
                  )}
                  onClick={() => {
                    onDownload(problem);
                  }}
                >
                  <TableCell>
                    {index + 1}. {problem.title}
                  </TableCell>
                  <TableCell align="right">
                    <ProblemStatusBadge
                      isAccepted={problem.isAccepted}
                      wrongSubmissions={problem.wrongSubmissions}
                    />
                  </TableCell>
                </TableRow>
              ))
            : problems?.map((problem, index) => (
                <TableRow
                  key={problem.id}
                  className={cls(
                    "p-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition flex justify-between",
                    index % 2 === 1 && "bg-gray-50",
                  )}
                  onClick={() => {
                    onDownload(problem);
                  }}
                >
                  <TableCell>
                    {index + 1}. {problem.title}
                  </TableCell>
                </TableRow>
              ))}
        </TableSection>
      </Table>
    </div>
  );
}
