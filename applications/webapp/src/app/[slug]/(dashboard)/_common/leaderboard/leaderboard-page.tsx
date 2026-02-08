"use client";

import { ChevronDoubleUpIcon } from "@heroicons/react/24/solid";
import React from "react";

import { LeaderboardMemberRow } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-member-row";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
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
            <LeaderboardMemberRow
              key={member.id}
              member={member}
              index={index}
              isHighlighted={member.id === session?.member.id}
            />
          ))}
        </GridTable.Body>
      </GridTable>
    </>
  );
}
