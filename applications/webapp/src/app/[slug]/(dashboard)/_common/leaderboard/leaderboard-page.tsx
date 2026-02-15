"use client";

import { ArrowDown01Icon, AwardIcon, SnowflakeIcon } from "lucide-react";
import { useState } from "react";

import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/problem-status-badge";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { cn } from "@/app/_lib/util/cn";
import { useAppSelector } from "@/app/_store/store";
import { leaderboardWritter } from "@/config/composition";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.page-title",
    defaultMessage: "Forseti - Leaderboard",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.page-description",
    defaultMessage: "View contest leaderboard and rankings.",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerScore: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.header-penalty",
    defaultMessage: "Penalty",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.empty",
    defaultMessage: "No contestants yet",
  },
  rulesExplanation: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.rules-explanation",
    defaultMessage:
      "Rankings are determined by: 1) Total problems solved (more is better); 2) Total penalty time (less is better); 3) Time of accepted submissions (earlier is better); 4) Name (alphabetical). Penalty includes submission time plus 20 minutes for each wrong answer before acceptance.",
  },
  frozenLabel: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.frozen-label",
    defaultMessage: "Frozen",
  },
  freezeLabel: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.freeze-label",
    defaultMessage: "Freeze",
  },
  unfreezeLabel: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unfreeze-label",
    defaultMessage: "Unfreeze",
  },
  freezeSuccess: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.freeze-success",
    defaultMessage: "Leaderboard frozen successfully.",
  },
  unfreezeSuccess: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unfreeze-success",
    defaultMessage: "Leaderboard unfrozen successfully.",
  },
  freezeError: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.freeze-error",
    defaultMessage: "Failed to freeze the leaderboard.",
  },
  unfreezeError: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unfreeze-error",
    defaultMessage: "Failed to unfreeze the leaderboard.",
  },
  freezeConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.freeze-confirmation-title",
    defaultMessage: "Confirm Freeze",
  },
  freezeConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.freeze-confirmation-description",
    defaultMessage:
      "Are you sure you want to freeze the leaderboard? This will prevent any further updates until it is unfrozen.",
  },
  unfreezeConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unfreeze-confirmation-title",
    defaultMessage: "Confirm Unfreeze",
  },
  unfreezeConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page.unfreeze-confirmation-description",
    defaultMessage:
      "Are you sure you want to unfreeze the leaderboard? This will allow updates to be reflected again.",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  leaderboard: LeaderboardResponseDTO;
  canEdit?: boolean;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard, canEdit }: Props) {
  const session = useAppSelector((state) => state.session);
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const contestStatus = useContestStatusWatcher();
  const freezeToggleState = useLoadableState();
  const toast = useToast();
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  async function toggleFreeze() {
    const method = leaderboard.isFrozen
      ? leaderboardWritter.unfreeze.bind(leaderboardWritter)
      : leaderboardWritter.freeze.bind(leaderboardWritter);
    const successMessage = leaderboard.isFrozen
      ? messages.unfreezeSuccess
      : messages.freezeSuccess;
    const errorMessage = leaderboard.isFrozen
      ? messages.unfreezeError
      : messages.freezeError;

    freezeToggleState.start();
    try {
      await method(contestId);
      toast.success(successMessage);
      setConfirmationDialogOpen(false);
      freezeToggleState.finish();
    } catch (error) {
      await freezeToggleState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  function getMedal(index: number) {
    if (index >= 12) {
      return index + 1;
    }
    const color = [
      "text-yellow-400 fill-yellow-400",
      "text-gray-300 fill-gray-300",
      "text-yellow-600 fill-yellow-600",
    ][Math.floor(index / 4)];
    return (
      <>
        <AwardIcon
          className={cn("fill-foreground inline h-5", color)}
          strokeWidth={3}
        />
        {index + 1}
      </>
    );
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <Card className="my-5">
        <CardContent>
          {canEdit && (
            <div className="mb-3 flex justify-end">
              <AsyncButton
                variant="secondary"
                onClick={() => setConfirmationDialogOpen(true)}
                isLoading={freezeToggleState.isLoading}
                disabled={contestStatus === ContestStatus.ENDED}
                data-testid="freeze-toggle-button"
              >
                <FormattedMessage
                  {...(leaderboard.isFrozen
                    ? messages.unfreezeLabel
                    : messages.freezeLabel)}
                />
              </AsyncButton>

              <ConfirmationDialog
                isOpen={isConfirmationDialogOpen}
                title={
                  leaderboard.isFrozen
                    ? messages.unfreezeConfirmationTitle
                    : messages.freezeConfirmationTitle
                }
                description={
                  leaderboard.isFrozen
                    ? messages.unfreezeConfirmationDescription
                    : messages.freezeConfirmationDescription
                }
                onConfirm={toggleFreeze}
                onCancel={() => setConfirmationDialogOpen(false)}
                isLoading={freezeToggleState.isLoading}
              />
            </div>
          )}
          {leaderboard.isFrozen && (
            <div
              className="text-md flex items-center justify-center gap-1 bg-blue-400 text-white"
              data-testid="frozen-indicator"
            >
              <SnowflakeIcon size={16} />
              <FormattedMessage {...messages.frozenLabel} />
            </div>
          )}
          <Table data-testid="leaderboard-table" className="border-b-1">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDown01Icon size={16} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerContestant} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerScore} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.headerPenalty} />
                </TableHead>
                {problems.map((problem) => (
                  <TableHead key={problem.id} className="text-center">
                    {problem.letter}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.members.map((member, index) => (
                <TableRow
                  key={member.id}
                  className={cn(
                    member.id === session?.member.id && "bg-primary-50",
                  )}
                  data-testid="leaderboard-member-row"
                >
                  <TableCell data-testid="member-rank">
                    {getMedal(index)}
                  </TableCell>
                  <TableCell data-testid="member-name">{member.name}</TableCell>
                  <TableCell data-testid="member-score">
                    {member.score}
                  </TableCell>
                  <TableCell data-testid="member-penalty">
                    {member.penalty}
                  </TableCell>
                  {member.problems.map((problem) => (
                    <TableCell
                      key={problem.id}
                      className="text-center"
                      data-testid="member-problem"
                    >
                      <ProblemStatusBadge
                        isAccepted={problem.isAccepted}
                        acceptedAt={problem.acceptedAt}
                        wrongSubmissions={problem.wrongSubmissions}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Alert className="bg-muted mt-7 py-2">
            <AlertDescription className="text-xs">
              <FormattedMessage {...messages.rulesExplanation} />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
