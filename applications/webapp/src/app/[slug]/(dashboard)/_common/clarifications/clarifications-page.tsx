import { MessageCircleQuestion, Plus } from "lucide-react";
import React from "react";

import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-card";
import { ClarificationsPageForm } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page-form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/_lib/component/shadcn/empty";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useAppSelector } from "@/app/_store/store";
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
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center">
        {/* Create Form */}
        {canCreate && isCreateFormOpen && (
          <ClarificationsPageForm
            contestId={contestId}
            onClose={() => setIsCreateFormOpen(false)}
            problems={problems}
          />
        )}
        {canCreate && !isCreateFormOpen && (
          <Button
            className="mb-5"
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <Plus size={16} />
            <FormattedMessage {...messages.newLabel} />
          </Button>
        )}
        {canCreate && <Separator className="my-5 w-full max-w-4xl" />}

        {/* Empty State */}
        {clarifications.length == 0 && (
          <Empty data-testid="empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleQuestion size={48} />
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
          <div className="w-full max-w-4xl space-y-5">
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
      </div>
    </Page>
  );
}
