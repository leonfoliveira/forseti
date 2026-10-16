import { MessageCircleQuestionIcon, PlusIcon } from "lucide-react";
import React from "react";

import { ClarificationsPageCard } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPageCard";
import { ClarificationsPageForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationsPageForm";
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
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

type Props = {
  problems: ProblemResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  canCreate?: boolean;
  canAnswer?: boolean;
} & (
  | {
      canCreate: true;
      onCreate: (clarification: ClarificationResponseDTO) => void;
    }
  | {
      canCreate?: false;
      onCreate?: (clarification: ClarificationResponseDTO) => void;
    }
) &
  (
    | {
        canAnswer: true;
        onAnswer: (data: ClarificationResponseDTO) => void;
        onPublish: (data: ClarificationResponseDTO) => void;
      }
    | {
        canAnswer?: false;
        onAnswer?: (data: ClarificationResponseDTO) => void;
        onPublish?: (data: ClarificationResponseDTO) => void;
      }
  );

/**
 * Displays the clarifications page where users can view, request, and answer clarifications for contest problems.
 **/
export function ClarificationsPage({
  problems,
  clarifications,
  canCreate,
  onCreate,
  canAnswer,
  onAnswer,
  onPublish,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const contestStatus = useContestStatusWatcher();
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const shouldSeeCreationComponents =
    canCreate && contestStatus === ContestStatus.IN_PROGRESS;

  return (
    <Page
      title="Forseti - Clarifications"
      description="View and request clarifications for contest problems."
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
            New Clarification
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
              <EmptyTitle>No clarifications yet</EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              Clarifications will appear here once requested.
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
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .toReversed()
              .map((clarification) => (
                <ClarificationsPageCard
                  key={clarification.id}
                  contestId={contestId}
                  clarification={clarification}
                  canAnswer={canAnswer}
                  onAnswer={onAnswer as never}
                  onPublish={onPublish as never}
                />
              ))}
          </div>
        )}
        <Alert className="bg-card mt-5 w-full max-w-4xl py-2">
          <AlertDescription className="text-xs">
            Use this page to ask questions about contest problems and view
            official responses from judges. All clarifications and answers are
            visible to all contestants to ensure fairness. Ask specific
            questions about problem statements, input/output formats, or edge
            cases.
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
