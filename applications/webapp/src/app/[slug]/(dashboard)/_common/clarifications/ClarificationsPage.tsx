import { MessageCircleQuestionIcon, PlusIcon } from "lucide-react";
import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Page } from "@/app/_lib/component/page/Page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/_lib/component/shadcn/empty";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { useAppSelector } from "@/app/_lib/store/Store";
import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPageCard";
import { ClarificationsPageForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPageForm";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

type Props = {
  problems: ProblemResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  onCreate?: (clarification: ClarificationResponseDTO) => void;
  onAnswer?: (clarification: ClarificationResponseDTO) => void;
  onPublish?: (clarification: ClarificationResponseDTO) => void;
};

/**
 * Displays the clarifications page where users can view, request, and answer clarifications for contest problems.
 **/
export function ClarificationsPage({
  problems,
  clarifications,
  onCreate,
  onAnswer,
  onPublish,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const contestStatus = useContestStatusWatcher();
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const canCreate = !!onCreate;

  const shouldSeeCreationComponents =
    canCreate && contestStatus === ContestStatus.IN_PROGRESS;

  return (
    <Page
      title="[slug].(dashboard)._common.clarifications.ClarificationPage.pageTitle"
      description="[slug].(dashboard)._common.clarifications.ClarificationPage.pageDescription"
    >
      <div className="flex flex-col items-center py-5">
        {/* Create Form */}
        {shouldSeeCreationComponents && isCreateFormOpen && (
          <ClarificationsPageForm
            contestId={contestId}
            onClose={() => setIsCreateFormOpen(false)}
            onCreate={onCreate}
            problems={problems}
          />
        )}
        {shouldSeeCreationComponents && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            <FormattedMessage id="[slug].(dashboard)._common.clarifications.ClarificationPage.newClarification" />
          </Button>
        )}
        {shouldSeeCreationComponents && (
          <Separator className="my-5 w-full max-w-4xl" />
        )}

        {/* Empty State */}
        {clarifications.length == 0 && (
          <Empty data-testid="empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleQuestionIcon size={48} />
              </EmptyMedia>
              <EmptyTitle>
                <FormattedMessage id="[slug].(dashboard)._common.clarifications.ClarificationPage.emptyTitle" />
              </EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              <FormattedMessage id="[slug].(dashboard)._common.clarifications.ClarificationPage.emptyDescription" />
            </EmptyDescription>
          </Empty>
        )}
        {/* Items */}
        {clarifications.length > 0 && (
          <div
            className="w-full max-w-4xl space-y-5"
            data-testid="clarifications-list"
          >
            {clarifications
              .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((clarification) => (
                <ClarificationsPageCard
                  key={clarification.id}
                  contestId={contestId}
                  clarification={clarification}
                  onAnswer={onAnswer}
                  onPublish={onPublish}
                />
              ))}
          </div>
        )}
        <Alert className="bg-card mt-5 w-full max-w-4xl py-2">
          <AlertDescription className="text-xs">
            <FormattedMessage id="[slug].(dashboard)._common.clarifications.ClarificationPage.help" />
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
