import { MessageCircleQuestionIcon, PlusIcon } from "lucide-react";
import React from "react";

import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-card";
import { ClarificationsPageForm } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
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
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useAppSelector } from "@/app/_store/store";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.page-title",
    defaultMessage: "Forseti - Clarifications",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.page-description",
    defaultMessage: "View and request clarifications for contest problems.",
  },
  newLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.new-label",
    defaultMessage: "New Clarification",
  },
  emptyTitle: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.empty-title",
    defaultMessage: "No clarifications yet",
  },
  emptyDescription: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.empty-description",
    defaultMessage: "Clarifications will appear here once requested.",
  },
  guidanceText: {
    id: "app.[slug].(dashboard)._common.clarifications.clarifications-page.guidance-text",
    defaultMessage:
      "Use this page to ask questions about contest problems and view official responses from judges. All clarifications and answers are visible to all contestants to ensure fairness. Ask specific questions about problem statements, input/output formats, or edge cases.",
  },
});

type Props = {
  problems: ProblemPublicResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  canCreate?: boolean;
  canAnswer?: boolean;
};

/**
 * Displays the clarifications page where users can view, request, and answer clarifications for contest problems.
 **/
export function ClarificationsPage({
  problems,
  clarifications,
  canCreate = false,
  canAnswer = false,
}: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const contestStatus = useContestStatusWatcher();
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const shouldSeeCreationComponents =
    canCreate && contestStatus === ContestStatus.IN_PROGRESS;

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center py-5">
        {/* Create Form */}
        {shouldSeeCreationComponents && isCreateFormOpen && (
          <ClarificationsPageForm
            contestId={contestId}
            onClose={() => setIsCreateFormOpen(false)}
            problems={problems}
          />
        )}
        {shouldSeeCreationComponents && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            <FormattedMessage {...messages.newLabel} />
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
                <FormattedMessage {...messages.emptyTitle} />
              </EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              <FormattedMessage {...messages.emptyDescription} />
            </EmptyDescription>
          </Empty>
        )}

        {/* Items */}
        {clarifications.length > 0 && (
          <div
            className="w-full max-w-4xl space-y-5"
            data-testid="clarifications-list"
          >
            {clarifications.toReversed().map((clarification) => (
              <ClarificationsPageCard
                key={clarification.id}
                contestId={contestId}
                clarification={clarification}
                canAnswer={canAnswer}
              />
            ))}
          </div>
        )}

        <Alert className="bg-card mt-5 w-full max-w-4xl py-2">
          <AlertDescription className="text-xs">
            <FormattedMessage {...messages.guidanceText} />
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
