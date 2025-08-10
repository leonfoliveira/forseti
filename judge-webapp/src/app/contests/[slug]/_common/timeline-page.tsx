"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { cls } from "@/app/_util/cls";
import { useAuthorization } from "@/app/_context/authorization-context";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/_component/badge/submission-answer-badge";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";
import { FormattedLanguage } from "@/app/_component/format/formatted-language";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  headerTimestamp: {
    id: "contests.[slug]._common.timeline-page.header-timestamp",
    defaultMessage: "Timestamp",
  },
  headerContestant: {
    id: "contests.[slug]._common.timeline-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerProblem: {
    id: "contests.[slug]._common.timeline-page.header-problem",
    defaultMessage: "Problem",
  },
  headerLanguage: {
    id: "contests.[slug]._common.timeline-page.header-language",
    defaultMessage: "Language",
  },
  headerAnswer: {
    id: "contests.[slug]._common.timeline-page.header-answer",
    defaultMessage: "Answer",
  },
  submissionsEmpty: {
    id: "contests.[slug]._common.timeline-page.submissions-empty",
    defaultMessage: "No submissions yet",
  },
});

type Props = {
  submissions: SubmissionPublicResponseDTO[];
};

/**
 * A generic timeline page component for displaying contest submissions.
 */
export function TimelinePage({ submissions }: Props) {
  const authorization = useAuthorization();

  return (
    <div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header data-testid="header-timestamp">
              <FormattedMessage {...messages.headerTimestamp} />
            </TableCell>
            <TableCell header data-testid="header-contestant">
              <FormattedMessage {...messages.headerContestant} />
            </TableCell>
            <TableCell header data-testid="header-problem">
              <FormattedMessage {...messages.headerProblem} />
            </TableCell>
            <TableCell header data-testid="header-language">
              <FormattedMessage {...messages.headerLanguage} />
            </TableCell>
            <TableCell header align="right" data-testid="header-answer">
              <FormattedMessage {...messages.headerAnswer} />
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
                <FormattedLanguage language={submission.language} />
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
          <p className="text-neutral-content">
            <FormattedMessage {...messages.submissionsEmpty} />
          </p>
        </div>
      )}
    </div>
  );
}
