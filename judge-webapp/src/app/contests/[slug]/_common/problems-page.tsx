"use client";

import React from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { DownloadButton } from "@/app/_component/form/download-button";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionAnswerShortBadge } from "@/app/_component/badge/submission-answer-short-badge";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  problemTitle: {
    id: "app.contests.[slug]._common.problems-page.problem-title",
    defaultMessage: "{letter}. {title}",
  },
});

type Props = {
  contest: ContestPublicResponseDTO;
  contestantStatus?: Record<string, Record<SubmissionAnswer, number>>;
};

/**
 * A generic problem page component for displaying contest problems.
 * If `contestantStatus` is provided, it will show the status of each problem for the contestant.
 */
export function ProblemsPage({ contest, contestantStatus }: Props) {
  return (
    <div>
      <Table className="table-zebra">
        <TableSection>
          {contest.problems.map((problem) => (
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
    </div>
  );
}
