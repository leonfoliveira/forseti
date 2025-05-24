"use client";

import { useFindAllSubmissionsForMemberAction } from "@/app/_action/find-all-submissions-for-member-action";
import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import {
  formatLanguage,
  formatSubmissionStatus,
} from "@/app/_util/contest-utils";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { useContainer } from "@/app/_atom/container-atom";

export default function ContestSubmissionPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { attachmentService } = useContainer();
  const findAllSubmissionsForMemberAction =
    useFindAllSubmissionsForMemberAction();

  useEffect(() => {
    findAllSubmissionsForMemberAction.act(id);
  }, []);

  if (findAllSubmissionsForMemberAction.isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  function formatStatus(status: SubmissionStatus) {
    const text = formatSubmissionStatus(status);
    switch (status) {
      case SubmissionStatus.JUDGING:
        return <span>text</span>;
      case SubmissionStatus.ACCEPTED:
        return <span className="text-green-500">{text}</span>;
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return <span className="text-blue-500">{text}</span>;
      case SubmissionStatus.RUNTIME_ERROR:
      case SubmissionStatus.COMPILATION_ERROR:
        return <span className="text-yellow-500">{text}</span>;
      default:
        return <span className="text-red-500">{text}</span>;
    }
  }

  return (
    <Table>
      <TableSection>
        <TableRow>
          <TableCell header>Timestamp</TableCell>
          <TableCell header>Problem</TableCell>
          <TableCell header>Language</TableCell>
          <TableCell header align="right">
            Status
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {findAllSubmissionsForMemberAction.data
          ?.toReversed()
          .map((submission) => (
            <TableRow
              key={submission.id}
              className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition"
              onClick={() =>
                attachmentService.downloadAttachment(submission.code)
              }
            >
              <TableCell>{toLocaleString(submission.createdAt)}</TableCell>
              <TableCell>{submission.problem.title}</TableCell>
              <TableCell>{formatLanguage(submission.language)}</TableCell>
              <TableCell align="right">
                {formatStatus(submission.status)}
              </TableCell>
            </TableRow>
          ))}
      </TableSection>
    </Table>
  );
}
