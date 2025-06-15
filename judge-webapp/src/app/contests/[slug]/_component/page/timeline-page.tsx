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
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/_component/badge/submission-answer-badge";
import { TimestampDisplay } from "@/app/_component/timestamp-display";

type Props = {
  submissions: SubmissionPublicResponseDTO[];
};

/**
 * A generic timeline page component for displaying contest submissions.
 */
export function TimelinePage({ submissions }: Props) {
  const { authorization } = useAuthorization();

  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[slug]._component.page.timeline-page");

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
                  "bg-base-100",
              )}
              data-testid="submission-row"
            >
              <TableCell data-testid="submission:created-at">
                <TimestampDisplay timestamp={submission.createdAt} />
              </TableCell>
              <TableCell data-testid="submission:member">
                {submission.member.name}
              </TableCell>
              <TableCell data-testid="submission:problem">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission:language">
                {formatLanguage(submission.language)}
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission:answer"
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
          data-testid="submission:empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      )}
    </div>
  );
}
