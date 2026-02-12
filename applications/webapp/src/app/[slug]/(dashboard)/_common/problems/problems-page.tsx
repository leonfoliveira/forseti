"use client";

import { ArrowDownAZ, CircleCheck, Clock, Download } from "lucide-react";
import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { FormattedNumber } from "@/app/_lib/component/i18n/formatted-number";
import { Page } from "@/app/_lib/component/page/page";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader } from "@/config/composition";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.page-title",
    defaultMessage: "Forseti - Problems",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.page-description",
    defaultMessage: "View all problems for the contest.",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.empty",
    defaultMessage: "No problems yet",
  },
  problemHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.problem-header",
    defaultMessage: "Problem",
  },
  timeLimitHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.time-limit-header",
    defaultMessage: "Time Limit",
  },
  memoryLimitHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.memory-limit-header",
    defaultMessage: "Memory Limit",
  },
  statusHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.status-header",
    defaultMessage: "Status",
  },
  accepted: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.accepted",
    defaultMessage: "Accepted",
  },
  attempts: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.attempts",
    defaultMessage: "{attempts} Attempts",
  },
  notAttempted: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.not-attempted",
    defaultMessage: "Not attempted",
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
  const hasStatus = contestantClassificationProblems !== undefined;

  function getStatus(problemId: string) {
    const status = problemStatus?.[problemId];
    if (!status) return undefined;
    if (status.isAccepted)
      return (
        <p className="text-success text-xs">
          <CircleCheck size={14} className="mr-1 inline" />
          <FormattedMessage {...messages.accepted} />
        </p>
      );
    if (status.wrongSubmissions > 0)
      return (
        <p className="text-warning text-xs">
          <Clock size={14} className="mr-1 inline" />
          <FormattedMessage
            {...messages.attempts}
            values={{ attempts: status.wrongSubmissions }}
          />
        </p>
      );
    return (
      <Badge variant="secondary">
        <FormattedMessage {...messages.notAttempted} />
      </Badge>
    );
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <Card className="my-5">
        <CardContent>
          <Table>
            <TableHeader className="bg-content2">
              <TableRow>
                <TableHead>
                  <ArrowDownAZ size={16} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.problemHeader} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.timeLimitHeader} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.memoryLimitHeader} />
                </TableHead>
                {hasStatus && (
                  <TableHead className="text-center">
                    <FormattedMessage {...messages.statusHeader} />
                  </TableHead>
                )}
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-bold" data-testid="problem-letter">
                    {problem.letter}
                  </TableCell>
                  <TableCell data-testid="problem-title">
                    {problem.title}
                  </TableCell>
                  <TableCell data-testid="problem-time-limit">
                    <FormattedNumber
                      value={problem.timeLimit / 1000}
                      suffix="s"
                    />
                  </TableCell>
                  <TableCell data-testid="problem-memory-limit">
                    <FormattedNumber value={problem.memoryLimit} suffix=" MB" />
                  </TableCell>
                  {hasStatus && (
                    <TableCell
                      className="text-center"
                      data-testid="problem-status"
                    >
                      {getStatus(problem.id)}
                    </TableCell>
                  )}
                  <TableCell
                    className="text-right"
                    data-testid="problem-actions"
                  >
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() =>
                        attachmentReader.download(
                          contestId,
                          problem.description,
                        )
                      }
                      data-testid="problem-download"
                    >
                      <Download size={16} /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Page>
  );
}
