"use client";

import { faEdit, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { SubmissionAnswerBadge } from "@/app/_component/badge/submission-answer-badge";
import { SubmissionStatusBadge } from "@/app/_component/badge/submission-status-badge";
import { Button } from "@/app/_component/form/button";
import { DownloadButton } from "@/app/_component/form/download-button";
import { Select } from "@/app/_component/form/select";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";
import { DialogModal } from "@/app/_component/modal/dialog-modal";
import { Table } from "@/app/_component/table/table";
import { TableCell } from "@/app/_component/table/table-cell";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useModal } from "@/app/_util/modal-hook";
import { UpdateSubmissionFormType } from "@/app/contests/[slug]/judge/submissions/_form/update-submission-form";
import { updateSubmissionFormSchema } from "@/app/contests/[slug]/judge/submissions/_form/update-submission-form-schema";
import { submissionService } from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { globalMessages } from "@/i18n/global";
import { useAlert } from "@/store/slices/alerts-slice";
import { useJudgeDashboard } from "@/store/slices/judge-dashboard-slice";

const messages = defineMessages({
  rerunSuccess: {
    defaultMessage: "Submission reenqueued successfully",
    id: "app.contests.[slug].judge.submissions.page.rerun-success",
  },
  rerunError: {
    defaultMessage: "Error reenqueuing submission",
    id: "app.contests.[slug].judge.submissions.page.rerun-error",
  },
  updateSuccess: {
    defaultMessage: "Submission updated successfully",
    id: "app.contests.[slug].judge.submissions.page.update-success",
  },
  updateError: {
    defaultMessage: "Error updating submission",
    id: "app.contests.[slug].judge.submissions.page.update-error",
  },
  headerTimestamp: {
    defaultMessage: "Timestamp",
    id: "app.contests.[slug].judge.submissions.page.header-timestamp",
  },
  headerProblem: {
    defaultMessage: "Problem",
    id: "app.contests.[slug].judge.submissions.page.header-problem",
  },
  headerLanguage: {
    defaultMessage: "Language",
    id: "app.contests.[slug].judge.submissions.page.header-language",
  },
  headerStatus: {
    defaultMessage: "Status",
    id: "app.contests.[slug].judge.submissions.page.header-status",
  },
  headerAnswer: {
    defaultMessage: "Answer",
    id: "app.contests.[slug].judge.submissions.page.header-answer",
  },
  rerunTooltip: {
    defaultMessage: "Rerun",
    id: "app.contests.[slug].judge.submissions.page.rerun-tooltip",
  },
  updateTooltip: {
    defaultMessage: "Update",
    id: "app.contests.[slug].judge.submissions.page.update-tooltip",
  },
  confirmRerun: {
    defaultMessage: "Are you sure you want to rerun this submission?",
    id: "app.contests.[slug].judge.submissions.page.confirm-rerun",
  },
  answerLabel: {
    defaultMessage: "Answer",
    id: "app.contests.[slug].judge.submissions.page.answer-label",
  },
  confirmUpdate: {
    defaultMessage: "Are you sure you want to update this submission?",
    id: "app.contests.[slug].judge.submissions.page.confirm-update",
  },
});

/**
 * Submissions page for judges in a contest.
 * Displays a list of all submissions with options to rerun or update answers.
 */
export default function JudgeSubmissionsPage() {
  const submissions = useJudgeDashboard((state) => state.submissions);
  const rerunState = useLoadableState();
  const updateState = useLoadableState();

  const rerunModal = useModal<string>();
  const updateModal = useModal<string>();
  const alert = useAlert();

  const updateForm = useForm<UpdateSubmissionFormType>({
    resolver: joiResolver(updateSubmissionFormSchema),
  });

  async function rerun(submissionId: string) {
    rerunState.start();
    try {
      await submissionService.rerunSubmission(submissionId);
      rerunModal.close();
      alert.success(messages.rerunSuccess);
      rerunState.finish();
    } catch (error) {
      rerunState.fail(error, {
        default: () => alert.error(messages.rerunError),
      });
    }
  }

  async function update(submissionId: string, data: UpdateSubmissionFormType) {
    updateState.start();
    try {
      await submissionService.updateSubmissionAnswer(submissionId, data);
      updateModal.close();
      alert.success(messages.updateSuccess);
      updateState.finish();
    } catch (error) {
      updateState.fail(error, {
        default: () => alert.error(messages.updateError),
      });
    }
  }

  return (
    <>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header data-testid="header-timestamp">
              <FormattedMessage {...messages.headerTimestamp} />
            </TableCell>
            <TableCell header data-testid="header-problem">
              <FormattedMessage {...messages.headerProblem} />
            </TableCell>
            <TableCell header data-testid="header-language">
              <FormattedMessage {...messages.headerLanguage} />
            </TableCell>
            <TableCell header align="right" data-testid="header-status">
              <FormattedMessage {...messages.headerStatus} />
            </TableCell>
            <TableCell header align="right" data-testid="header-answer">
              <FormattedMessage {...messages.headerAnswer} />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {submissions?.map((submission) => (
            <TableRow key={submission.id} data-testid="submission-row">
              <TableCell data-testid="submission-created-at">
                <FormattedDateTime timestamp={submission.createdAt} />
              </TableCell>
              <TableCell data-testid="submission-letter">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission-language">
                <FormattedMessage
                  {...globalMessages.language[submission.language]}
                />
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission-status"
              >
                <SubmissionStatusBadge status={submission.status} />
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission-answer"
              >
                <SubmissionAnswerBadge answer={submission.answer} />
              </TableCell>
              <TableCell>
                <fieldset className="flex justify-end gap-x-2">
                  <Button
                    leftIcon={<FontAwesomeIcon icon={faRotate} />}
                    onClick={() => rerunModal.open(submission.id)}
                    tooltip={messages.rerunTooltip}
                    disabled={submission.status === SubmissionStatus.JUDGING}
                    className="text-xs btn-soft"
                    data-testid="rerun"
                  />
                  <Button
                    leftIcon={<FontAwesomeIcon icon={faEdit} />}
                    onClick={() => updateModal.open(submission.id)}
                    tooltip={messages.updateTooltip}
                    className="text-xs btn-soft"
                    data-testid="update"
                  />
                  <DownloadButton attachment={submission.code} />
                </fieldset>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>

      <DialogModal
        modal={rerunModal}
        onConfirm={rerun}
        isLoading={rerunState.isLoading}
      >
        <FormattedMessage {...messages.confirmRerun} />
      </DialogModal>

      <DialogModal
        modal={updateModal}
        onConfirm={(id) =>
          updateForm.handleSubmit((data) => update(id, data))()
        }
        isLoading={updateState.isLoading}
      >
        <Select
          form={updateForm}
          name="answer"
          label={messages.answerLabel}
          options={Object.values(SubmissionAnswer)
            .filter((a) => a !== SubmissionAnswer.NO_ANSWER)
            .map((answer) => ({
              value: answer,
              label: globalMessages.submissionAnswer[answer],
            }))}
          data-testid="update-form-answer"
        />
        <FormattedMessage {...messages.confirmUpdate} />
      </DialogModal>
    </>
  );
}
