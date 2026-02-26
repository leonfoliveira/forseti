"use client";

import {
  ArrowDownAZIcon,
  CircleCheckIcon,
  ClockIcon,
  DownloadIcon,
} from "lucide-react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/problem-letter-badge";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { FormattedNumber } from "@/app/_lib/component/i18n/formatted-number";
import { Page } from "@/app/_lib/component/page/page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
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
import { useErrorHandler } from "@/app/_lib/hook/error-handler-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
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
  testCasesHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.test-cases-header",
    defaultMessage: "Test Cases",
  },
  statusHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.status-header",
    defaultMessage: "Status",
  },
  descriptionHeader: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.description-header",
    defaultMessage: "Description",
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
  testCasesDownloadError: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.test-cases-download-error",
    defaultMessage: "Failed to download problem test cases",
  },
  descriptionDownloadError: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.description-download-error",
    defaultMessage: "Failed to download problem description",
  },
  guidanceText: {
    id: "app.[slug].(dashboard)._common.problems.problems-page.guidance-text",
    defaultMessage:
      "Here you can view all contest problems. Click the PDF button to download problem statements. Time and memory limits are displayed for each problem.",
  },
});

type Props = {
  problems: ProblemResponseDTO[] | ProblemWithTestCasesResponseDTO[];
  canDownloadTestCases?: boolean;
  leaderboardRow?: LeaderboardResponseDTO["rows"][number];
};

/**
 * Displays the problems page where users can view all problems for the contest.
 **/
export function ProblemsPage({
  problems,
  canDownloadTestCases,
  leaderboardRow,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const errorHandler = useErrorHandler();
  const toast = useToast();

  const leaderboardCellsMap = leaderboardRow?.cells?.reduce(
    (acc, cell) => {
      acc[cell.problemId] = cell;
      return acc;
    },
    {} as Record<
      string,
      LeaderboardResponseDTO["rows"][number]["cells"][number]
    >,
  );
  const hasStatus = leaderboardRow !== undefined;

  function getStatus(problemId: string) {
    const cell = leaderboardCellsMap?.[problemId];
    if (!cell) return undefined;
    if (cell.isAccepted)
      return (
        <p className="text-xs text-green-700 dark:text-green-300">
          <CircleCheckIcon size={14} className="mr-1 inline" />
          <FormattedMessage {...messages.accepted} />
        </p>
      );
    if (cell.wrongSubmissions > 0)
      return (
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          <ClockIcon size={14} className="mr-1 inline" />
          <FormattedMessage
            {...messages.attempts}
            values={{ attempts: cell.wrongSubmissions }}
          />
        </p>
      );
    return (
      <Badge variant="secondary">
        <FormattedMessage {...messages.notAttempted} />
      </Badge>
    );
  }

  async function downloadTestCases(problem: ProblemWithTestCasesResponseDTO) {
    console.debug("Downloading test cases for problem:", problem.id);

    try {
      await Composition.attachmentReader.download(contestId, problem.testCases);

      console.debug(
        "Problem test cases downloaded successfully for problem:",
        problem.id,
      );
    } catch (error) {
      await errorHandler.handle(error as Error, {
        default: () => toast.error(messages.descriptionDownloadError),
      });
    }
  }

  async function downloadDescription(problem: ProblemResponseDTO) {
    console.debug("Downloading description for problem:", problem.id);

    try {
      await Composition.attachmentReader.download(
        contestId,
        problem.description,
      );

      console.debug(
        "Problem description downloaded successfully for problem:",
        problem.id,
      );
    } catch (error) {
      await errorHandler.handle(error as Error, {
        default: () => toast.error(messages.descriptionDownloadError),
      });
    }
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <Card className="my-5">
        <CardContent>
          <Table data-testid="problems-table" className="border-b-1">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDownAZIcon size={16} />
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
                {canDownloadTestCases && (
                  <TableHead className="text-right">
                    <FormattedMessage {...messages.testCasesHeader} />
                  </TableHead>
                )}
                <TableHead className="text-right">
                  <FormattedMessage {...messages.descriptionHeader} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id} data-testid="problem-row">
                  <TableCell className="font-bold" data-testid="problem-letter">
                    <ProblemLetterBadge problem={problem} />
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
                  {canDownloadTestCases && (
                    <TableCell
                      data-testid="problem-test-cases"
                      className="text-right"
                    >
                      <Button
                        size="xs"
                        onClick={() =>
                          downloadTestCases(
                            problem as ProblemWithTestCasesResponseDTO,
                          )
                        }
                        data-testid="problem-download-test-cases"
                      >
                        <DownloadIcon size={16} /> CSV
                      </Button>
                    </TableCell>
                  )}
                  <TableCell
                    className="text-right"
                    data-testid="problem-download-description"
                  >
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => downloadDescription(problem)}
                      data-testid="problem-download"
                    >
                      <DownloadIcon size={16} /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Alert className="bg-muted mt-7 py-2">
            <AlertDescription className="text-xs">
              <FormattedMessage {...messages.guidanceText} />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
