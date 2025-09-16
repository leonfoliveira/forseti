"use client";

import { ChevronDoubleUpIcon } from "@heroicons/react/24/solid";
import React from "react";

import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";
import { ProblemStatusChip } from "@/lib/component/chip/problem-status-chip";
import { FormattedDuration } from "@/lib/component/format/formatted-duration";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { Metadata } from "@/lib/component/metadata";
import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableColumn,
  GridTableHeader,
  GridTableRow,
} from "@/lib/component/table/grid-table";
import { Chip } from "@/lib/heroui-wrapper";
import { cls } from "@/lib/util/cls";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.page-title",
    defaultMessage: "Judge - Leaderboard",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.page-description",
    defaultMessage: "View contest leaderboard and rankings.",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerScore: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.header-penalty",
    defaultMessage: "Penalty",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.empty",
    defaultMessage: "No contestants yet",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  leaderboard: LeaderboardResponseDTO;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard }: Props) {
  const session = useAppSelector((state) => state.session);

  function getMedal(index: number) {
    if (index >= 3) {
      return index + 1;
    }
    const color = ["bg-yellow-400", "bg-gray-200", "bg-yellow-600"][index];
    return (
      <Chip variant="flat" className={cls("font-semibold", color)}>
        {index + 1}
      </Chip>
    );
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <GridTable
        style={{
          gridTemplateColumns:
            problems.length > 0
              ? `auto 1fr repeat(${problems.length}, 1fr) auto auto`
              : "auto 1fr auto auto",
        }}
      >
        <GridTableHeader>
          <GridTableColumn>
            # <ChevronDoubleUpIcon className="ml-2 h-3" />
          </GridTableColumn>
          <GridTableColumn>
            <FormattedMessage {...messages.headerContestant} />
          </GridTableColumn>
          {problems.map((problem) => (
            <GridTableColumn key={problem.id} className="justify-center">
              {problem.letter}
            </GridTableColumn>
          ))}
          <GridTableColumn className="justify-end">
            <FormattedMessage {...messages.headerScore} />
          </GridTableColumn>
          <GridTableColumn className="justify-end">
            <FormattedMessage {...messages.headerPenalty} />
          </GridTableColumn>
        </GridTableHeader>
        <GridTableBody emptyContent={<FormattedMessage {...messages.empty} />}>
          {leaderboard.members.map((member, index) => (
            <GridTableRow
              key={member.id}
              className={cls(
                index % 2 == 1 && "bg-content2",
                member.id === session?.member.id && "bg-primary-50",
              )}
              data-testid="member"
            >
              <GridTableCell data-testid="member-index">
                {getMedal(index)}
              </GridTableCell>
              <GridTableCell data-testid="member-name">
                {member.name}
              </GridTableCell>
              {member.problems.map((problem, index) => (
                <GridTableCell
                  key={problem.id}
                  className={cls(
                    "justify-center",
                    index % 2 == 0 && "bg-content2",
                  )}
                  data-testid="member-problem"
                >
                  <ProblemStatusChip
                    size="sm"
                    isAccepted={problem.isAccepted}
                    acceptedAt={problem.acceptedAt}
                    wrongSubmissions={problem.wrongSubmissions}
                  />
                </GridTableCell>
              ))}
              <GridTableCell className="justify-end" data-testid="member-score">
                {member.score}
              </GridTableCell>
              <GridTableCell
                className="justify-end"
                data-testid="member-penalty"
              >
                <FormattedDuration ms={member.penalty * 1000} />
              </GridTableCell>
            </GridTableRow>
          ))}
        </GridTableBody>
      </GridTable>
    </>
  );
}
