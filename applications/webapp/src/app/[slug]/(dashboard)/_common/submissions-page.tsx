"use client";

import {
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
  ChevronDoubleDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { SubmissionFormMap } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-map";
import { submissionFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-schema";
import { SubmissionJudgeFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form";
import { submissionJudgeFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form-schema";
import { SubmissionAnswerChip } from "@/app/_lib/component/chip/submission-answer-chip";
import { SubmissionStatusChip } from "@/app/_lib/component/chip/submission-status-chip";
import { FileInput } from "@/app/_lib/component/form/file-input";
import { FormField } from "@/app/_lib/component/form/form-field";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { GavelIcon } from "@/app/_lib/component/icon/GavelIcon";
import { Metadata } from "@/app/_lib/component/metadata";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableColumn,
  GridTableHeader,
  GridTableRow,
} from "@/app/_lib/component/table/grid-table";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  Tooltip,
} from "@/app/_lib/heroui-wrapper";
import { cls } from "@/app/_lib/util/cls";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
import { useToast } from "@/app/_lib/util/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader, submissionWritter } from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages, Message } from "@/i18n/message";

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
  const intl = useIntl();

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
          <Card
            className="max-w-4xl w-full mb-6 mx-auto"
            data-testid="create-form"
          >
            <CardHeader>
              <h3
                className="text-lg font-semibold"
                data-testid="create-form-title"
              >
                <FormattedMessage {...messages.createTitle} />
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <form
                onSubmit={form.handleSubmit(createSubmission)}
                className="grid gap-2"
                ref={formRef}
              >
                <FormField form={form} name="problemId" isSelect>
                  <Select
                    label={<FormattedMessage {...messages.problemLabel} />}
                  >
                    {problems.map((it) => (
                      <SelectItem key={it.id}>
                        {intl.formatMessage({
                          ...messages.problemOption,
                          values: it,
                        } as Message)}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>
                <FormField form={form} name="language" isSelect>
                  <Select
                    label={<FormattedMessage {...messages.languageLabel} />}
                  >
                    {languages.map((it) => (
                      <SelectItem key={it}>
                        {intl.formatMessage(globalMessages.language[it])}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>
                <FormField form={form} name="code" isFile>
                  <FileInput
                    label={<FormattedMessage {...messages.codeLabel} />}
                    description={
                      <FormattedMessage {...messages.codeDescription} />
                    }
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    color="primary"
                    isLoading={createState.isLoading}
                    endContent={<PaperAirplaneIcon height={12} />}
                    data-testid="create-form-submit"
                  >
                    <FormattedMessage {...messages.submitLabel} />
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
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
        <GridTableHeader>
          <GridTableColumn>
            <FormattedMessage {...messages.headerTimestamp} />
            <ChevronDoubleDownIcon className="ml-2 h-3" />
          </GridTableColumn>
          <GridTableColumn>
            <FormattedMessage {...messages.headerContestant} />
          </GridTableColumn>
          <GridTableColumn className="justify-end">
            <FormattedMessage {...messages.headerProblem} />
          </GridTableColumn>
          <GridTableColumn className="justify-end">
            <FormattedMessage {...messages.headerLanguage} />
          </GridTableColumn>
          <GridTableColumn className="justify-end">
            <FormattedMessage {...messages.headerAnswer} />
          </GridTableColumn>
          {canEdit && (
            <GridTableColumn>
              <FormattedMessage {...messages.headerStatus} />
            </GridTableColumn>
          )}
          {canEdit && <GridTableColumn>{/* Actions column */}</GridTableColumn>}
        </GridTableHeader>
        <GridTableBody emptyContent={<FormattedMessage {...messages.empty} />}>
          {submissions.toReversed().map((submission, index) => (
            <GridTableRow
              key={submission.id}
              className={cls(
                index % 2 == 1 && "bg-content2",
                session?.member.id === submission.member.id && "bg-primary-50",
                submission.status === SubmissionStatus.FAILED && "bg-danger-50",
              )}
              data-testid="submission"
            >
              <GridTableCell data-testid="submission-created-at">
                <FormattedDateTime timestamp={submission.createdAt} />
              </GridTableCell>
              <GridTableCell data-testid="submission-member-name">
                {submission.member.name}
              </GridTableCell>
              <GridTableCell
                className="justify-end"
                data-testid="submission-problem-letter"
              >
                {submission.problem.letter}
              </GridTableCell>
              <GridTableCell
                className="justify-end"
                data-testid="submission-language"
              >
                <FormattedMessage
                  {...globalMessages.language[submission.language]}
                />
              </GridTableCell>
              <GridTableCell
                className="justify-end"
                data-testid="submission-answer"
              >
                <SubmissionAnswerChip size="sm" answer={submission.answer} />
              </GridTableCell>
              {canEdit && (
                <GridTableCell data-testid="submission-status">
                  <SubmissionStatusChip size="sm" status={submission.status} />
                </GridTableCell>
              )}
              {canEdit && (
                <GridTableCell data-testid="submission-actions">
                  <Tooltip
                    content={<FormattedMessage {...messages.downloadTooltip} />}
                  >
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      size="sm"
                      onPress={() =>
                        attachmentReader.download(
                          contestId,
                          (submission as SubmissionFullResponseDTO).code,
                        )
                      }
                      data-testid="submission-download"
                    >
                      <ArrowDownTrayIcon className="h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content={<FormattedMessage {...messages.resubmitTooltip} />}
                  >
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      size="sm"
                      disabled={submission.status === SubmissionStatus.JUDGING}
                      onPress={() => resubmitModal.open(submission.id)}
                      data-testid="submission-resubmit"
                    >
                      <ArrowPathRoundedSquareIcon className="h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content={<FormattedMessage {...messages.judgeTooltip} />}
                  >
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      size="sm"
                      onPress={() => judgeModal.open(submission.id)}
                      data-testid="submission-judge"
                    >
                      <GavelIcon className="h-5" />
                    </Button>
                  </Tooltip>
                </GridTableCell>
              )}
            </GridTableRow>
          ))}
        </GridTableBody>
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
        body={
          <>
            <FormField form={judgeForm} name="answer" isSelect>
              <Select
                className="mb-5"
                label={<FormattedMessage {...messages.answerLabel} />}
              >
                {Object.keys(SubmissionAnswer)
                  .filter((it) => it !== SubmissionAnswer.NO_ANSWER)
                  .map((key) => (
                    <SelectItem key={key}>
                      {intl.formatMessage(
                        globalMessages.submissionAnswer[
                          key as SubmissionAnswer
                        ],
                      )}
                    </SelectItem>
                  ))}
              </Select>
            </FormField>
            <FormattedMessage {...messages.judgeBody} />
          </>
        }
        data-testid="judge-modal"
      />
    </>
  );
}
