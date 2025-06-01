"use client";

import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { useFindAllSubmissionsAction } from "@/app/_action/find-all-submissions-action";
import { SubmissionStatusBadge } from "@/app/contests/[id]/_component/submission-status-badge";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";

export default function ContestTimelinePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { data: submissions, ...action } = useFindAllSubmissionsAction();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[id].timeline");

  useEffect(() => {
    action.act(id);
  }, []);

  return (
    <div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header>{t("header-timestamp")}</TableCell>
            <TableCell header>{t("header-contestant")}</TableCell>
            <TableCell header>{t("header-problem")}</TableCell>
            <TableCell header>{t("header-language")}</TableCell>
            <TableCell header align="right">
              {t("header-status")}
            </TableCell>
          </TableRow>
        </TableSection>
        <TableSection>
          {submissions?.map((submission) => (
            <TableRow
              key={submission.id}
              className="hover:bg-gray-100 transition"
              data-testid="submission:row"
            >
              <TableCell data-testid="submission:created-at">
                {toLocaleString(submission.createdAt)}
              </TableCell>
              <TableCell data-testid="submission:member">
                {submission.member.name}
              </TableCell>
              <TableCell data-testid="submission:problem">
                {submission.problem.title}
              </TableCell>
              <TableCell data-testid="submission:language">
                {formatLanguage(submission.language)}
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission:status"
              >
                <SubmissionStatusBadge status={submission.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {action.isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" data-testid="submission:spinner" />
        </div>
      )}
      {!action.isLoading && submissions?.length === 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="submission:empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      )}
    </div>
  );
}
