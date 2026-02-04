"use client";

import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";
import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { SubmissionFormMap } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-map";
import { submissionFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-schema";
import { SubmissionJudgeFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form";
import { submissionJudgeFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form-schema";
import { CreateSubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/create-submission-form";
import { JudgeSubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/judge-submission-form";
import { SubmissionRow } from "@/app/[slug]/(dashboard)/_common/submissions/submission-row";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import { cls } from "@/app/_lib/util/cls";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
import { useToast } from "@/app/_lib/util/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { submissionWritter } from "@/config/composition";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.submissions-page.page-title",
    defaultMessage: "Forseti - Submissions",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.submissions-page.page-description",
    defaultMessage: "View all submissions made during the contest.",
  },
  createTitle: {
    id: "app.[slug].(dashboard)._common.submissions-page.create-title",
    defaultMessage: "Create Submission",
  },
  problemLabel: {
    id: "app.[slug].(dashboard)._common.submissions-page.problem-label",
    defaultMessage: "Problem",
  },
  problemOption: {
    id: "app.[slug].(dashboard)._common.submissions-page.problem-option",
    defaultMessage: "{letter}. {title}",
  },
  languageLabel: {
    id: "app.[slug].(dashboard)._common.submissions-page.language-label",
    defaultMessage: "Language",
  },
  languageDescription: {
    id: "app.[slug].(dashboard)._common.submissions-page.language-description",
    defaultMessage: "Select the programming language used in the submission.",
  },
  codeLabel: {
    id: "app.[slug].(dashboard)._common.submissions-page.code-label",
    defaultMessage: "Code",
  },
  codeDescription: {
    id: "app.[slug].(dashboard)._common.submissions-page.code-description",
    defaultMessage: "Upload an uncompiled code file.",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.submissions-page.submit-label",
    defaultMessage: "Submit",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.submissions-page.create-success",
    defaultMessage: "Submission created successfully.",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.submissions-page.create-error",
    defaultMessage: "Error creating submission.",
  },
  headerTimestamp: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-timestamp",
    defaultMessage: "Timestamp",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-contestant",
    defaultMessage: "Contestant",
  },
  headerProblem: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-problem",
    defaultMessage: "Problem",
  },
  headerLanguage: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-language",
    defaultMessage: "Language",
  },
  headerAnswer: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-answer",
    defaultMessage: "Answer",
  },
  headerStatus: {
    id: "app.[slug].(dashboard)._common.submissions-page.header-status",
    defaultMessage: "Status",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.submissions-page.empty",
    defaultMessage: "No submissions yet",
  },
  resubmitTitle: {
    id: "app.[slug].(dashboard)._common.submissions-page.resubmit-title",
    defaultMessage: "Resubmit Submission",
  },
  resubmitBody: {
    id: "app.[slug].(dashboard)._common.submissions-page.resubmit-body",
    defaultMessage: "Are you sure you want to resubmit this submission?",
  },
  resubmitSuccess: {
    id: "app.[slug].(dashboard)._common.submissions-page.resubmit-success",
    defaultMessage: "Submission resubmitted successfully.",
  },
  resubmitError: {
    id: "app.[slug].(dashboard)._common.submissions-page.resubmit-error",
    defaultMessage: "Error resubmitting submission.",
  },
  judgeTitle: {
    id: "app.[slug].(dashboard)._common.submissions-page.judge-title",
    defaultMessage: "Judge Submission",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.submissions-page.answer-label",
    defaultMessage: "Answer",
  },
  judgeBody: {
    id: "app.[slug].(dashboard)._common.submissions-page.judge-body",
    defaultMessage: "Are you sure you want to judge this submission?",
  },
  judgeSuccess: {
    id: "app.[slug].(dashboard)._common.submissions-page.judge-success",
    defaultMessage: "Submission judged successfully.",
  },
  judgeError: {
    id: "app.[slug].(dashboard)._common.submissions-page.judge-error",
    defaultMessage: "Error judging submission.",
  },
  downloadTooltip: {
    id: "app.[slug].(dashboard)._common.submissions-page.download-tooltip",
    defaultMessage: "Download",
  },
  resubmitTooltip: {
    id: "app.[slug].(dashboard)._common.submissions-page.resubmit-tooltip",
    defaultMessage: "Resubmit",
  },
  judgeTooltip: {
    id: "app.[slug].(dashboard)._common.submissions-page.judge-tooltip",
    defaultMessage: "Judge",
  },
});

type Props = {
  submissions: SubmissionPublicResponseDTO[] | SubmissionFullResponseDTO[];
  problems?: ProblemPublicResponseDTO[] | ProblemFullResponseDTO[];
  languages?: SubmissionLanguage[];
  canCreate?: boolean;
  canEdit?: boolean;
};

/**
 * A generic submissions page component for displaying contest submissions.
 */
export function SubmissionsPage({
  submissions,
  problems,
  languages,
  canCreate,
  canEdit,
}: Props) {
  const session = useAppSelector((state) => state.session);
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const createState = useLoadableState();
  const resubmitState = useLoadableState();
  const judgeState = useLoadableState();
  const toast = useToast();

  const resubmitModal = useModal<string>();
  const judgeModal = useModal<string>();
  const form = useForm<SubmissionFormType>({
    resolver: joiResolver(submissionFormSchema),
    defaultValues: SubmissionFormMap.getDefault(),
  });
  const judgeForm = useForm<SubmissionJudgeFormType>({
    resolver: joiResolver(submissionJudgeFormSchema),
    defaultValues: { answer: undefined },
  });
  const formRef = React.useRef<HTMLFormElement>(null);

  async function createSubmission(data: SubmissionFormType) {
    createState.start();
    try {
      await submissionWritter.create(
        contestId,
        SubmissionFormMap.toInputDTO(data),
      );
      form.reset();
      formRef.current?.reset();
      toast.success(messages.createSuccess);
      createState.finish();
    } catch (error) {
      createState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  async function resubmitSubmission(submissionId: string) {
    resubmitState.start();
    try {
      await submissionWritter.rerun(contestId, submissionId);
      toast.success(messages.resubmitSuccess);
      resubmitModal.close();
      resubmitState.finish();
    } catch (error) {
      resubmitState.fail(error, {
        default: () => toast.error(messages.resubmitError),
      });
    }
  }

  async function judgeSubmission(
    submissionId: string,
    data: SubmissionJudgeFormType,
  ) {
    judgeState.start();
    try {
      await submissionWritter.updateAnswer(
        contestId,
        submissionId,
        data.answer,
      );
      toast.success(messages.judgeSuccess);
      judgeForm.reset();
      judgeModal.close();
      judgeState.finish();
    } catch (error) {
      judgeState.fail(error, {
        default: () => toast.error(messages.judgeError),
      });
    }
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      {/* Create Form */}
      {canCreate && !!problems && !!languages && (
        <>
          <CreateSubmissionForm
            form={form}
            onCreate={createSubmission}
            isLoading={createState.isLoading}
            formRef={formRef}
            problems={problems}
            languages={languages}
          />
          <Divider className="mb-5" />
        </>
      )}

      {/* Submission Table */}
      <GridTable
        className={cls(
          canEdit
            ? "grid-cols-[auto_1fr_repeat(5,auto)]"
            : "grid-cols-[auto_1fr_repeat(3,auto)]",
        )}
      >
        <GridTable.Header>
          <GridTable.Column>
            <FormattedMessage {...messages.headerTimestamp} />
            <ChevronDoubleDownIcon className="ml-2 h-3" />
          </GridTable.Column>
          <GridTable.Column>
            <FormattedMessage {...messages.headerContestant} />
          </GridTable.Column>
          <GridTable.Column className="justify-end">
            <FormattedMessage {...messages.headerProblem} />
          </GridTable.Column>
          <GridTable.Column className="justify-end">
            <FormattedMessage {...messages.headerLanguage} />
          </GridTable.Column>
          <GridTable.Column className="justify-end">
            <FormattedMessage {...messages.headerAnswer} />
          </GridTable.Column>
          {canEdit && (
            <GridTable.Column>
              <FormattedMessage {...messages.headerStatus} />
            </GridTable.Column>
          )}
          {canEdit && (
            <GridTable.Column>{/* Actions column */}</GridTable.Column>
          )}
        </GridTable.Header>
        <GridTable.Body emptyContent={<FormattedMessage {...messages.empty} />}>
          {submissions.toReversed().map((submission, index) => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              index={index}
              isHighlighted={submission.member.id === session?.member.id}
              canEdit={canEdit}
              contestId={contestId}
              onJudge={judgeModal.open}
              onResubmit={resubmitModal.open}
            />
          ))}
        </GridTable.Body>
      </GridTable>

      {/* Modals */}
      <ConfirmationModal
        isOpen={resubmitModal.isOpen}
        isLoading={resubmitState.isLoading}
        onClose={resubmitModal.close}
        onConfirm={() => resubmitSubmission(resubmitModal.props)}
        title={<FormattedMessage {...messages.resubmitTitle} />}
        body={<FormattedMessage {...messages.resubmitBody} />}
        data-testid="resubmit-modal"
      />

      <ConfirmationModal
        isOpen={judgeModal.isOpen}
        isLoading={judgeState.isLoading}
        onClose={judgeModal.close}
        onConfirm={judgeForm.handleSubmit((data) =>
          judgeSubmission(judgeModal.props, data),
        )}
        title={<FormattedMessage {...messages.judgeTitle} />}
        body={<JudgeSubmissionForm form={judgeForm} />}
        data-testid="judge-modal"
      />
    </>
  );
}
