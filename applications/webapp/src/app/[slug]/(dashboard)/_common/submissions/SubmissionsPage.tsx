"use client";

import clsx from "clsx";
import { ArrowUp10Icon, FunnelIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionsMenu";
import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageForm";
import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/ProblemLetterBadge";
import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/SubmissionAnswerBadge";
import { SubmissionStatusBadge } from "@/app/_lib/component/display/badge/SubmissionStatusBadge";
import { FormattedDateTime } from "@/app/_lib/component/i18n/FormattedDateTime";
import { Page } from "@/app/_lib/component/page/Page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { Toggle } from "@/app/_lib/component/shadcn/toggle";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { useAppSelector } from "@/app/_lib/store/Store";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";

type Props = {
  submissions:
    | SubmissionResponseDTO[]
    | SubmissionWithCodeResponseDTO[]
    | SubmissionWithCodeAndExecutionResponseDTO[];
  memberSubmissions?: SubmissionWithCodeResponseDTO[];
  problems: ProblemResponseDTO[];
  canViewExecutions?: boolean;
} & (
  | {
      canCreate: true;
      onCreate: (submission: SubmissionWithCodeResponseDTO) => void;
    }
  | {
      canCreate?: false;
      onCreate?: (submission: SubmissionWithCodeResponseDTO) => void;
    }
) &
  (
    | {
        canEdit: true;
        onEdit: (submission: SubmissionWithCodeAndExecutionResponseDTO) => void;
      }
    | {
        canEdit?: false;
        onEdit?: (
          submission: SubmissionWithCodeAndExecutionResponseDTO,
        ) => void;
      }
  );

/**
 * A generic submissions page component for displaying contest submissions.
 */
export function SubmissionsPage({
  submissions,
  memberSubmissions,
  problems,
  canViewExecutions,
  canCreate,
  onCreate,
  canEdit,
  onEdit,
}: Props) {
  const session = useAppSelector((state) => state.session);
  const contestStatus = useContestStatusWatcher();
  const [isOnlyMine, setIsOnlyMine] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const memberSubmissionsMap = new Map(
    memberSubmissions?.map((s) => [s.id, s]) ?? [],
  );
  const mergedSubmissions = submissions.map(
    (s) => memberSubmissionsMap.get(s.id) ?? s,
  );

  const hasCode = mergedSubmissions.some((s) => "code" in s && !!s.code);
  const hasAnyAction = canEdit || hasCode;
  const shouldSeeCreationComponents =
    canCreate && contestStatus === ContestStatus.IN_PROGRESS;

  return (
    <Page
      title="Forseti - Submissions"
      description="View and manage contest submissions."
    >
      <div className="flex flex-col items-center py-5">
        {/* Create Form */}
        {shouldSeeCreationComponents && isCreateFormOpen && (
          <SubmissionsPageForm
            onClose={() => setIsCreateFormOpen(false)}
            problems={problems}
            onCreate={onCreate}
          />
        )}

        {shouldSeeCreationComponents && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            New Submission
          </Button>
        )}
        {shouldSeeCreationComponents && (
          <Separator className="my-5 w-full max-w-4xl" />
        )}

        <Card className="w-full">
          <CardContent>
            {memberSubmissions !== undefined && (
              <div className="mb-4 flex justify-end">
                <Toggle
                  variant="outline"
                  pressed={isOnlyMine}
                  onPressedChange={setIsOnlyMine}
                  data-testid="only-mine-toggle"
                >
                  <FunnelIcon className={clsx(isOnlyMine && "fill-black")} />
                  Only Mine
                </Toggle>
              </div>
            )}
            <Table className="border-b" data-testid="submissions-table">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>
                    Timestamp
                    <ArrowUp10Icon size={16} className="ml-1 inline" />
                  </TableHead>
                  <TableHead>Contestant</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Answer</TableHead>
                  {hasAnyAction && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isOnlyMine && memberSubmissions !== undefined
                  ? memberSubmissions.toReversed()
                  : mergedSubmissions.toReversed()
                ).map((submission) => (
                  <TableRow
                    key={submission.id}
                    className={clsx(
                      submission.member.id === session?.member.id &&
                        "font-bold",
                    )}
                    data-testid="submission-row"
                  >
                    <TableCell data-testid="submission-timestamp">
                      <FormattedDateTime timestamp={submission.createdAt} />
                    </TableCell>
                    <TableCell data-testid="submission-member">
                      {submission.member.name}
                    </TableCell>
                    <TableCell data-testid="submission-problem">
                      <ProblemLetterBadge problem={submission.problem} />
                    </TableCell>
                    <TableCell data-testid="submission-language">
                      {EnumeratedTextUtil.getSubmissionLanguage(
                        submission.language,
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      data-testid="submission-status"
                    >
                      <SubmissionStatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      data-testid="submission-answer"
                    >
                      {submission.answer && (
                        <SubmissionAnswerBadge answer={submission.answer} />
                      )}
                    </TableCell>
                    {hasAnyAction && (
                      <TableCell data-testid="submission-actions">
                        <SubmissionsPageActionsMenu
                          submission={
                            submission as
                              | SubmissionWithCodeResponseDTO
                              | SubmissionWithCodeAndExecutionResponseDTO
                          }
                          canViewExecutions={canViewExecutions}
                          canEdit={canEdit}
                          onEdit={onEdit as any}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Alert className="bg-muted mt-7 py-2">
              <AlertDescription className="text-xs">
                {
                  "View all contest submissions here. Submissions are judged automatically and results appear in real-time. You can see the status (judging/judged/failed) and answer (accepted/wrong answer/compilation error/runtime error/time limit exceeded/memory limit exceeded) for each submission."
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
