"use client";

import {
  ArrowDownTrayIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/solid";
import React from "react";

import { attachmentService } from "@/config/composition";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";
import { ProblemStatusChip } from "@/lib/component/chip/problem-status-chip";
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
import { Button } from "@/lib/heroui-wrapper";
import { cls } from "@/lib/util/cls";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.problems-page.page-title",
    defaultMessage: "Judge - Problems",
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
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  contestantClassificationProblems?: LeaderboardResponseDTO["members"][number]["problems"];
};

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
        <GridTableHeader>
          <GridTableColumn width={60}>
            # <ChevronDoubleUpIcon className="ml-2 h-3" />
          </GridTableColumn>
          <GridTableColumn>
            <FormattedMessage {...messages.problemHeader} />
          </GridTableColumn>
          {problemStatus && <GridTableColumn> </GridTableColumn>}
          <GridTableColumn> </GridTableColumn>
        </GridTableHeader>
        <GridTableBody emptyContent={<FormattedMessage {...messages.empty} />}>
          {problems.map((problem, index) => (
            <GridTableRow
              key={problem.id}
              className={cls(index % 2 == 1 && "bg-content2/50")}
              data-testid="problem"
            >
              <GridTableCell data-testid="problem-letter">
                {problem.letter}
              </GridTableCell>
              <GridTableCell data-testid="problem-title">
                {problem.title}
              </GridTableCell>
              {problemStatus && (
                <GridTableCell data-testid="problem-status">
                  <ProblemStatusChip
                    size="sm"
                    isAccepted={problemStatus[problem.id].isAccepted}
                    acceptedAt={problemStatus[problem.id].acceptedAt}
                    wrongSubmissions={
                      problemStatus[problem.id].wrongSubmissions
                    }
                  />
                </GridTableCell>
              )}
              <GridTableCell>
                <Button
                  isIconOnly
                  color="primary"
                  variant="light"
                  size="sm"
                  onPress={() =>
                    attachmentService.download(contestId, problem.description)
                  }
                  data-testid="problem-download"
                >
                  <ArrowDownTrayIcon className="h-5" />
                </Button>
              </GridTableCell>
            </GridTableRow>
          ))}
        </GridTableBody>
      </GridTable>
    </>
  );
}
