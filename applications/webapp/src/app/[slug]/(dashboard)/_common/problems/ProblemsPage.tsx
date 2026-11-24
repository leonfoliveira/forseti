import {
  ArrowDownAZIcon,
  CircleCheckIcon,
  ClockIcon,
  DownloadIcon,
} from "lucide-react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/ProblemLetterBadge";
import { FormattedNumber } from "@/app/_lib/component/i18n/FormattedNumber";
import { Page } from "@/app/_lib/component/page/Page";
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
import { useErrorHandler } from "@/app/_lib/hook/useErrorHandler";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

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
          <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.accepted" />
        </p>
      );
    if (cell.wrongSubmissions > 0)
      return (
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          <ClockIcon size={14} className="mr-1 inline" />
          <FormattedMessage
            id="[slug].(dashboard)._common.problems.ProblemsPage.attempts"
            values={{ count: cell.wrongSubmissions }}
          />
        </p>
      );
    return (
      <Badge variant="secondary">
        <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.notAttempted" />
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
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.problems.ProblemsPage.testCasesDownloadFailed",
          ),
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
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.problems.ProblemsPage.descriptionDownloadFailed",
          ),
      });
    }
  }

  return (
    <Page
      title="[slug].(dashboard)._common.problems.ProblemsPage.pageTitle"
      description="[slug].(dashboard)._common.problems.ProblemsPage.pageDescription"
    >
      <Card className="my-5">
        <CardContent>
          <Table data-testid="problems-table" className="border-b">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDownAZIcon size={16} />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerProblem" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerTimeLimit" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerMemoryLimit" />
                </TableHead>
                {hasStatus && (
                  <TableHead className="text-center">
                    <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerStatus" />
                  </TableHead>
                )}
                {canDownloadTestCases && (
                  <TableHead className="text-right">
                    <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerTestCases" />
                  </TableHead>
                )}
                <TableHead className="text-right">
                  <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.headerDescription" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems
                .toSorted((a, b) => a.letter.localeCompare(b.letter))
                .map((problem) => (
                  <TableRow key={problem.id} data-testid="problem-row">
                    <TableCell
                      className="font-bold"
                      data-testid="problem-letter"
                    >
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
                      <FormattedNumber
                        value={problem.memoryLimit}
                        suffix=" MB"
                      />
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
                          <DownloadIcon size={16} className="mr-1" />
                          <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.downloadCSV" />
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
                        <DownloadIcon size={16} className="mr-1" />
                        <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.downloadPDF" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <Alert className="bg-muted mt-7 py-2">
            <AlertDescription className="text-xs">
              <FormattedMessage id="[slug].(dashboard)._common.problems.ProblemsPage.help" />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
