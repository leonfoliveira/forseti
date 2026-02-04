"use client";

import { ChevronDoubleUpIcon } from "@heroicons/react/24/solid";
import React from "react";

import { Chip } from "@/app/_lib/component/base/display/chip";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { ProblemStatusChip } from "@/app/_lib/component/chip/problem-status-chip";
import { FormattedDuration } from "@/app/_lib/component/format/formatted-duration";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { cls } from "@/app/_lib/util/cls";
import { useAppSelector } from "@/app/_store/store";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard-page.page-title",
    defaultMessage: "Forseti - Leaderboard",
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
        <GridTable.Header>
          <GridTable.Column>
            # <ChevronDoubleUpIcon className="ml-2 h-3" />
          </GridTable.Column>
          <GridTable.Column>
            <FormattedMessage {...messages.headerContestant} />
          </GridTable.Column>
          {problems.map((problem) => (
            <GridTable.Column key={problem.id} className="justify-center">
              {problem.letter}
            </GridTable.Column>
          ))}
          <GridTable.Column className="justify-end">
            <FormattedMessage {...messages.headerScore} />
          </GridTable.Column>
          <GridTable.Column className="justify-end">
            <FormattedMessage {...messages.headerPenalty} />
          </GridTable.Column>
        </GridTable.Header>
        <GridTable.Body emptyContent={<FormattedMessage {...messages.empty} />}>
          {leaderboard.members.map((member, index) => (
            <GridTable.Row
              key={member.id}
              className={cls(
                index % 2 == 1 && "bg-content2",
                member.id === session?.member.id && "bg-primary-50",
              )}
              data-testid="member"
            >
              <GridTable.Cell data-testid="member-index">
                {getMedal(index)}
              </GridTable.Cell>
              <GridTable.Cell data-testid="member-name">
                {member.name}
              </GridTable.Cell>
              {member.problems.map((problem, index) => (
                <GridTable.Cell
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
                </GridTable.Cell>
              ))}
              <GridTable.Cell
                className="justify-end"
                data-testid="member-score"
              >
                {member.score}
              </GridTable.Cell>
              <GridTable.Cell
                className="justify-end"
                data-testid="member-penalty"
              >
                <FormattedDuration ms={member.penalty * 1000} />
              </GridTable.Cell>
            </GridTable.Row>
          ))}
        </GridTable.Body>
      </GridTable>
    </>
  );
}
