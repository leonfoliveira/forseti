"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { cls } from "@/app/_util/cls";
import { useAuthorization } from "@/app/_context/authorization-context";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/_component/badge/submission-answer-badge";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";

type Props = {
  submissions: SubmissionPublicResponseDTO[];
};

/**
 * A generic timeline page component for displaying contest submissions.
 */
export function TimelinePage({ submissions }: Props) {
  const authorization = useAuthorization();

  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[slug]._common.timeline-page");

  return (
    <div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header data-testid="header-timestamp">
              {t("header-timestamp")}
            </TableCell>
            <TableCell header data-testid="header-contestant">
              {t("header-contestant")}
            </TableCell>
            <TableCell header data-testid="header-problem">
              {t("header-problem")}
            </TableCell>
            <TableCell header data-testid="header-language">
              {t("header-language")}
            </TableCell>
            <TableCell header align="right" data-testid="header-answer">
              {t("header-answer")}
            </TableCell>
          </TableRow>
        </TableSection>
        <TableSection>
          {submissions?.map((submission) => (
            <TableRow
              key={submission.id}
              className={cls(
                "hover:bg-base-100 transition",
                submission.member.id === authorization?.member.id &&
                  "bg-base-100"
              )}
              data-testid="submission-row"
            >
              <TableCell data-testid="submission-created-at">
                <FormattedDateTime timestamp={submission.createdAt} />
              </TableCell>
              <TableCell data-testid="submission-member">
                {submission.member.name}
              </TableCell>
              <TableCell data-testid="submission-problem">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission-language">
                {formatLanguage(submission.language)}
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission-answer"
              >
                <SubmissionAnswerBadge answer={submission.answer} />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {submissions.length === 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="submission-empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      )}
    </div>
  );
}
