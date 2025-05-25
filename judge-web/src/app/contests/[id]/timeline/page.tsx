"use client";

import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { formatLanguage } from "@/app/_util/contest-utils";
import { useFindAllSubmissionsAction } from "@/app/_action/find-all-submissions-action";
import { SubmissionStatusBadge } from "@/app/contests/[id]/_component/submission-status-badge";

export default function ContestTimelinePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { data: submissions, ...action } = useFindAllSubmissionsAction();

  useEffect(() => {
    action.act(id);
  }, []);

  if (action.isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Table>
      <TableSection head>
        <TableRow>
          <TableCell header>Timestamp</TableCell>
          <TableCell header>Contestant</TableCell>
          <TableCell header>Problem</TableCell>
          <TableCell header>Language</TableCell>
          <TableCell header align="right">
            Status
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {submissions?.toReversed().map((submission) => (
          <TableRow
            key={submission.id}
            className="hover:bg-gray-100 transition"
          >
            <TableCell>{toLocaleString(submission.createdAt)}</TableCell>
            <TableCell>{submission.member.name}</TableCell>
            <TableCell>{submission.problem.title}</TableCell>
            <TableCell>{formatLanguage(submission.language)}</TableCell>
            <TableCell align="right" className="font-semibold">
              <SubmissionStatusBadge status={submission.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
