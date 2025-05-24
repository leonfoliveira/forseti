"use client";

import { useFindAllSubmissionsForMemberAction } from "@/app/_action/find-all-submissions-for-member-action";
import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { formatLanguage } from "@/app/_util/contest-utils";
import { useContainer } from "@/app/_atom/container-atom";
import { SubmissionStatusBadge } from "@/app/contests/[id]/_component/submission-status-badge";
import { useSubmissionForMemberListener } from "@/app/_listener/submission-for-member-listener";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

export default function ContestSubmissionPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { attachmentService, authorizationService } = useContainer();
  const findAllSubmissionsForMemberAction =
    useFindAllSubmissionsForMemberAction();
  const submissionForMemberListener = useSubmissionForMemberListener();

  useEffect(() => {
    findAllSubmissionsForMemberAction.act(id);
    const member = authorizationService.getAuthorization()?.member;
    if (!member) return;
    submissionForMemberListener.subscribe(member?.id, receiveSubmission);
  }, []);

  function receiveSubmission(submission: SubmissionEmmitDTO) {
    findAllSubmissionsForMemberAction.force((data) => {
      if (!data) return data;
      const existingSubmission = data.find((it) => it.id === submission.id);
      if (!existingSubmission) {
        findAllSubmissionsForMemberAction.act(id);
        return undefined;
      }
      return data.map((it) =>
        it.id === submission.id
          ? {
              ...it,
              status: submission.status,
            }
          : it,
      );
    });
  }

  if (findAllSubmissionsForMemberAction.isLoading) {
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
              <TableCell align="right" className="font-semibold">
                <SubmissionStatusBadge status={submission.status} />
              </TableCell>
            </TableRow>
          ))}
      </TableSection>
    </Table>
  );
}
