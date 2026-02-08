import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";
import { clarificationFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-schema";
import { ClarificationCard } from "@/app/[slug]/(dashboard)/_common/clarifications/clarification-card";
import { CreateClarificationForm } from "@/app/[slug]/(dashboard)/_common/clarifications/create-clarification-form";
import { EmptyClarificationDisplay } from "@/app/[slug]/(dashboard)/_common/clarifications/empty-clarification-display";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
import { useToast } from "@/app/_lib/util/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.clarifications-page.page-title",
    defaultMessage: "Forseti - Clarifications",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.clarifications-page.page-description",
    defaultMessage: "View and request clarifications for contest problems.",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications-page.create-success",
    defaultMessage: "Clarification created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.clarifications-page.create-error",
    defaultMessage: "Failed to create clarification",
  },
  deleteSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-success",
    defaultMessage: "Clarification deleted successfully",
  },
  deleteError: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-error",
    defaultMessage: "Failed to delete clarification",
  },
  deleteTitle: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-title",
    defaultMessage: "Delete Clarification",
  },
  deleteConfirmLabel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-confirm-label",
    defaultMessage: "Are you sure you want to delete this clarification?",
  },
  deleteCancel: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-cancel",
    defaultMessage: "No, Cancel",
  },
  deleteConfirm: {
    id: "app.[slug].(dashboard)._common.clarifications-page.delete-confirm",
    defaultMessage: "Yes, Delete",
  },
});

type Props = {
  contestId: string;
  problems: ProblemPublicResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  canCreate?: boolean;
  canAnswer?: boolean;
};

/**
 * Displays the clarifications page where users can view, request, and answer clarifications for contest problems.
 **/
export function ClarificationsPage({
  contestId,
  problems,
  clarifications,
  canCreate = false,
  canAnswer = false,
}: Props) {
  const toast = useToast();
  const createState = useLoadableState();
  const deleteState = useLoadableState();

  const deleteModal = useModal<string>();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
    defaultValues: ClarificationFormMap.getDefault(),
  });

  async function createClarification(data: ClarificationFormType) {
    createState.start();
    try {
      await clarificationWritter.create(
        contestId,
        ClarificationFormMap.toInputDTO(data),
      );
      createState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      createState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  async function deleteClarification(id: string) {
    deleteState.start();
    try {
      await clarificationWritter.deleteById(contestId, id);
      deleteState.finish();
      deleteModal.close();
      toast.success(messages.deleteSuccess);
    } catch (error) {
      deleteState.fail(error, {
        default: () => toast.error(messages.deleteError),
      });
    }
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex flex-col items-center">
        {/* Create Form */}
        {canCreate && (
          <>
            <CreateClarificationForm
              form={form}
              onSubmit={createClarification}
              isLoading={createState.isLoading}
              problems={problems}
            />
            <Divider className="mb-5" />
          </>
        )}

        {/* Empty State */}
        {clarifications.length == 0 && <EmptyClarificationDisplay />}

        {/* Items */}
        {clarifications.length > 0 && (
          <div className="w-full max-w-4xl space-y-5">
            {clarifications.toReversed().map((clarification) => (
              <ClarificationCard
                key={clarification.id}
                contestId={contestId}
                clarification={clarification}
                canAnswer={canAnswer}
                onDelete={async (id) => {
                  deleteModal.open(id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        isLoading={deleteState.isLoading}
        onClose={deleteModal.close}
        title={<FormattedMessage {...messages.deleteTitle} />}
        body={<FormattedMessage {...messages.deleteConfirmLabel} />}
        onConfirm={() => deleteClarification(deleteModal.props)}
        data-testid="delete-modal"
      />
    </>
  );
}
