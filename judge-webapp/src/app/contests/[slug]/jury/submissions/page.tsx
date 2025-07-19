"use client";

import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/_component/badge/submission-answer-badge";
import { DownloadButton } from "@/app/contests/[slug]/_component/download-button";
import { Table } from "@/app/_component/table/table";
import React from "react";
import { useTranslations } from "next-intl";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faRotate } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/app/_component/form/button";
import { useModal } from "@/app/_util/modal-hook";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useLoadableState } from "@/app/_util/loadable-state";
import { submissionService } from "@/composition";
import { useAlert } from "@/app/_component/context/notification-context";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { UpdateSubmissionFormType } from "@/app/contests/[slug]/jury/submissions/_form/update-submission-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { updateSubmissionFormSchema } from "@/app/contests/[slug]/jury/submissions/_form/update-submission-form-schema";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";
import { SubmissionStatusBadge } from "@/app/contests/[slug]/_component/badge/submission-status-badge";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { TimestampDisplay } from "@/app/_component/timestamp-display";

/**
 * Submissions page for the jury in a contest.
 * Displays a list of all submissions with options to rerun or update answers.
 */
export default function JurySubmissionsPage() {
  const {
    jury: { fullSubmissions },
  } = useContest();
  const { formatLanguage, formatSubmissionAnswer } = useContestFormatter();
  const rerunState = useLoadableState();
  const updateState = useLoadableState();
  const rerunModal = useModal<string>();
  const updateModal = useModal<string>();
  const alert = useAlert();

  const t = useTranslations("contests.[slug].jury.submissions");
  const s = useTranslations(
    "contests.[slug].jury.submissions._form.update-submission-form",
  );

  const updateForm = useForm<UpdateSubmissionFormType>({
    resolver: joiResolver(updateSubmissionFormSchema),
  });

  async function rerun(submissionId: string) {
    rerunState.start();
    try {
      await submissionService.rerunSubmission(submissionId);
      rerunModal.close();
      alert.success(t("rerun-success"));
      rerunState.finish();
    } catch (error) {
      rerunState.fail(error, {
        default: () => alert.error(t("rerun-error")),
      });
    }
  }

  async function update(submissionId: string, data: UpdateSubmissionFormType) {
    updateState.start();
    try {
      await submissionService.updateSubmissionAnswer(submissionId, data);
      updateModal.close();
      alert.success(t("update-success"));
      updateState.finish();
    } catch (error) {
      updateState.fail(error, {
        default: () => alert.error(t("update-error")),
      });
    }
  }

  return (
    <>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header>{t("header-timestamp")}</TableCell>
            <TableCell header>{t("header-problem")}</TableCell>
            <TableCell header>{t("header-language")}</TableCell>
            <TableCell header align="right">
              {" "}
              {t("header-status")}
            </TableCell>
            <TableCell header align="right">
              {t("header-answer")}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {fullSubmissions?.map((submission) => (
            <TableRow key={submission.id} data-testid="submission-row">
              <TableCell data-testid="submission-created-at">
                <TimestampDisplay timestamp={submission.createdAt} />
              </TableCell>
              <TableCell data-testid="submission-title">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission-language">
                {formatLanguage(submission.language)}
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
                    onClick={() => rerunModal.open(submission.id)}
                    tooltip={t("rerun-tooltip")}
                    disabled={submission.status === SubmissionStatus.JUDGING}
                    className="text-xs btn-soft"
                  >
                    <FontAwesomeIcon icon={faRotate} />
                  </Button>
                  <Button
                    onClick={() => updateModal.open(submission.id)}
                    tooltip={t("update-tooltip")}
                    className="text-xs btn-soft"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
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
        {t("confirm-rerun")}
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
          label={t("update-form:answer:label")}
          s={s}
          options={Object.values(SubmissionAnswer)
            .filter((a) => a !== SubmissionAnswer.NO_ANSWER)
            .map((answer) => ({
              value: answer,
              label: formatSubmissionAnswer(answer),
            }))}
        />
        {t("confirm-update")}
      </DialogModal>
    </>
  );
}
