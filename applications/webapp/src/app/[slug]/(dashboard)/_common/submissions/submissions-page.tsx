"use client";

import { ArrowUp10, Funnel, Plus } from "lucide-react";
import React, { useState } from "react";

import { SubmissionsPageActionsMenu } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-actions-menu";
import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-form";
import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/submission-answer-chip";
import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
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
import { cn } from "@/app/_lib/util/cn";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.page-title",
    defaultMessage: "Forseti - Submissions",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.page-description",
    defaultMessage: "View all submissions made during the contest.",
  },
  onlyMineLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.only-mine-label",
    defaultMessage: "Only mine",
  },
  headerTimestamp: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.header-timestamp",
    defaultMessage: "Timestamp",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerProblem: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.header-problem",
    defaultMessage: "Problem",
  },
  headerLanguage: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.header-language",
    defaultMessage: "Language",
  },
  headerAnswer: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.header-answer",
    defaultMessage: "Answer",
  },
  newLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page.new-label",
    defaultMessage: "New Submission",
  },
});

type Props = {
  submissions: SubmissionPublicResponseDTO[] | SubmissionFullResponseDTO[];
  memberSubmissions?: SubmissionFullResponseDTO[];
  problems: ProblemPublicResponseDTO[];
  canCreate?: boolean;
  canEdit?: boolean;
};

/**
 * A generic submissions page component for displaying contest submissions.
 */
export function SubmissionsPage({
  submissions,
  memberSubmissions,
  problems,
  canCreate,
  canEdit,
}: Props) {
  const [isOnlyMine, setIsOnlyMine] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const memberSubmissionsMap = new Map(
    memberSubmissions?.map((s) => [s.id, s]) ?? [],
  );
  const mergedSubmissions = submissions.map(
    (s) => memberSubmissionsMap.get(s.id) ?? s,
  );

  const hasMemberSubmissions = memberSubmissions !== undefined;
  const hasAnyAction = canEdit || hasMemberSubmissions;

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center py-5">
        {/* Create Form */}
        {canCreate && isCreateFormOpen && (
          <SubmissionsPageForm
            onClose={() => setIsCreateFormOpen(false)}
            problems={problems}
          />
        )}

        {canCreate && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <Plus size={16} />
            <FormattedMessage {...messages.newLabel} />
          </Button>
        )}
        {canCreate && <Separator className="my-5 w-full max-w-4xl" />}

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
                  <Funnel className={cn(isOnlyMine && "fill-black")} />
                  <FormattedMessage {...messages.onlyMineLabel} />
                </Toggle>
              </div>
            )}
            <Table data-testid="submissions-table">
              <TableHeader className="bg-content2">
                <TableRow>
                  <TableHead>
                    <FormattedMessage {...messages.headerTimestamp} />
                    <ArrowUp10 size={16} className="ml-1 inline" />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerContestant} />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerProblem} />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerLanguage} />
                  </TableHead>
                  <TableHead className="text-right">
                    <FormattedMessage {...messages.headerAnswer} />
                  </TableHead>
                  {hasAnyAction && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isOnlyMine && memberSubmissions !== undefined
                  ? memberSubmissions.toReversed()
                  : mergedSubmissions.toReversed()
                ).map((submission) => (
                  <TableRow key={submission.id} data-testid="submission-row">
                    <TableCell data-testid="submission-timestamp">
                      <FormattedDateTime timestamp={submission.createdAt} />
                    </TableCell>
                    <TableCell data-testid="submission-member">
                      {submission.member.name}
                    </TableCell>
                    <TableCell data-testid="submission-problem">
                      {submission.problem.letter}
                    </TableCell>
                    <TableCell data-testid="submission-language">
                      <FormattedMessage
                        {...globalMessages.submissionLanguage[
                          submission.language
                        ]}
                      />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      data-testid="submission-answer"
                    >
                      <SubmissionAnswerBadge answer={submission.answer} />
                    </TableCell>
                    {hasAnyAction && (
                      <TableCell data-testid="submission-actions">
                        <SubmissionsPageActionsMenu
                          submission={submission as SubmissionFullResponseDTO}
                          canEdit={canEdit}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
