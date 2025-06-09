"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { useContest } from "@/app/contests/[slug]/_context";
import { SubmissionStatusBadge } from "@/app/contests/[slug]/_component/submission-status-badge";

export default function ContestTimelinePage() {
  const { submissions } = useContest();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[slug].timeline");

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
          {submissions.map((submission) => (
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
      {submissions.length === 0 && (
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
