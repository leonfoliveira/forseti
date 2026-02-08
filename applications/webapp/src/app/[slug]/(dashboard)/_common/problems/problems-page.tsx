"use client";

import { ChevronDoubleUpIcon } from "@heroicons/react/24/solid";
import React from "react";

import { ProblemRow } from "@/app/[slug]/(dashboard)/_common/problems/problem-row";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { cls } from "@/app/_lib/util/cls";
import { useAppSelector } from "@/app/_store/store";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.problems-page.page-title",
    defaultMessage: "Forseti - Problems",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.problems-page.page-description",
    defaultMessage: "View all problems for the contest.",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.problems-page.empty",
    defaultMessage: "No problems yet",
  },
  problemHeader: {
    id: "app.[slug].(dashboard)._common.problems-page.problem-header",
    defaultMessage: "Problem",
  },
  timeLimitHeader: {
    id: "app.[slug].(dashboard)._common.problems-page.time-limit-header",
    defaultMessage: "Time Limit",
  },
  memoryLimitHeader: {
    id: "app.[slug].(dashboard)._common.problems-page.memory-limit-header",
    defaultMessage: "Memory Limit",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  contestantClassificationProblems?: LeaderboardResponseDTO["members"][number]["problems"];
};

/**
 * Displays the problems page where users can view all problems for the contest.
 **/
export function ProblemsPage({
  problems,
  contestantClassificationProblems,
}: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const problemStatus = contestantClassificationProblems?.reduce(
    (acc, problem) => {
      acc[problem.id] = problem;
      return acc;
    },
    {} as Record<
      string,
      LeaderboardResponseDTO["members"][number]["problems"][number]
    >,
  );

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <GridTable
        className={cls(
          problemStatus
            ? "grid-cols-[auto_1fr_auto_auto]"
            : "grid-cols-[auto_1fr_auto]",
        )}
      >
        <GridTable.Header>
          <GridTable.Column width={60}>
            # <ChevronDoubleUpIcon className="ml-2 h-3" />
          </GridTable.Column>
          <GridTable.Column>
            <FormattedMessage {...messages.problemHeader} />
          </GridTable.Column>
          <GridTable.Column>
            <FormattedMessage {...messages.timeLimitHeader} />
          </GridTable.Column>
          <GridTable.Column>
            <FormattedMessage {...messages.memoryLimitHeader} />
          </GridTable.Column>
          {problemStatus && <GridTable.Column> </GridTable.Column>}
          <GridTable.Column> </GridTable.Column>
        </GridTable.Header>
        <GridTable.Body emptyContent={<FormattedMessage {...messages.empty} />}>
          {problems.map((problem, index) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              index={index}
              problemStatus={
                problemStatus ? problemStatus[problem.id] : undefined
              }
              contestId={contestId}
            />
          ))}
        </GridTable.Body>
      </GridTable>
    </>
  );
}
