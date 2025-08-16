"use client";

import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { SubmissionAnswerShortBadge } from "@/lib/component/badge/submission-answer-short-badge";
import { DownloadButton } from "@/lib/component/form/download-button";
import { Metadata } from "@/lib/component/metadata";
import { Table } from "@/lib/component/table/table";
import { TableCell } from "@/lib/component/table/table-cell";
import { TableRow } from "@/lib/component/table/table-row";
import { TableSection } from "@/lib/component/table/table-section";

const messages = defineMessages({
  pageTitle: {
    id: "app.contests.[slug]._common.problems-page.page-title",
    defaultMessage: "Judge - Problems",
  },
  pageDescription: {
    id: "app.contests.[slug]._common.problems-page.page-description",
    defaultMessage: "View all problems for the contest.",
  },
  problemTitle: {
    id: "app.contests.[slug]._common.problems-page.problem-title",
    defaultMessage: "{letter}. {title}",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  contestantStatus?: Record<string, Record<SubmissionAnswer, number>>;
};

/**
 * A generic problem page component for displaying contest problems.
 * If `contestantStatus` is provided, it will show the status of each problem for the contestant.
 */
export function ProblemsPage({ problems, contestantStatus }: Props) {
  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <Table className="table-zebra">
        <TableSection>
          {problems.map((problem) => (
            <TableRow
              key={problem.id}
              className="hover:bg-base-100 transition"
              data-testid="problem-row"
            >
              <TableCell data-testid="problem-title">
                <FormattedMessage
                  {...messages.problemTitle}
                  values={{
                    letter: problem.letter,
                    title: problem.title,
                  }}
                />
                {contestantStatus && (
                  <span className="ml-2">
                    {Object.entries(contestantStatus[problem.id] || {}).map(
                      ([answer, amount]) =>
                        amount > 0 && (
                          <SubmissionAnswerShortBadge
                            key={`${problem.id}-${answer}`}
                            answer={answer as SubmissionAnswer}
                            amount={amount}
                            className="ml-1"
                          />
                        ),
                    )}
                  </span>
                )}
              </TableCell>
              <TableCell align="right" data-testid="download">
                <DownloadButton attachment={problem.description} />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </>
  );
}
