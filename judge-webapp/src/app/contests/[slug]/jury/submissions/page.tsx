"use client";

import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
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
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/context/notification-context";
import { handleError } from "@/app/_util/error-handler";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { UpdateSubmissionFormType } from "@/app/contests/[slug]/jury/submissions/_form/update-submission-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { updateSubmissionFormSchema } from "@/app/contests/[slug]/jury/submissions/_form/update-submission-form-schema";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";

export default function JurySubmissionsPage() {
  const {
    jury: { fullSubmissions },
  } = useContest();
  const { formatLanguage } = useContestFormatter();
  const rerunState = useLoadableState();
  const updateState = useLoadableState();
  const rerunModal = useModal<string>();
  const updateModal = useModal<string>();
  const alert = useAlert();

  const t = useTranslations("contests.[slug].jury.submissions");
  const s = useTranslations(
    "contests.[slug].jury.submissions.update-submission-form",
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
      rerunState.fail(error);
      handleError(error, {
        default: () => alert.error(t("rerun-fail")),
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
      updateState.fail(error);
      handleError(error, {
        default: () => alert.error(t("update-fail")),
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
              {t("header-status")}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {fullSubmissions?.map((submission) => (
            <TableRow key={submission.id} data-testid="submission:row">
              <TableCell data-testid="submission:created-at">
                {toLocaleString(submission.createdAt)}
              </TableCell>
              <TableCell data-testid="submission:title">
                {submission.problem.letter}
              </TableCell>
              <TableCell data-testid="submission:language">
                {formatLanguage(submission.language)}
              </TableCell>
              <TableCell
                align="right"
                className="font-semibold"
                data-testid="submission:status"
              >
                <SubmissionAnswerBadge answer={submission.answer} />
              </TableCell>
              <TableCell>
                <fieldset className="flex justify-end gap-x-2">
                  <Button
                    onClick={() => rerunModal.open(submission.id)}
                    className="text-xs h-5"
                  >
                    <FontAwesomeIcon icon={faRotate} />
                  </Button>
                  <Button className="text-xs h-5">
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
          fm={updateForm}
          name="answer"
          label={t("update-form:answer:label")}
          s={s}
          options={Object.values(SubmissionAnswer)
            .filter((a) => a !== SubmissionAnswer.NO_ANSWER)
            .map((answer) => ({
              value: answer,
              label: t(`submission-answer.${answer}`),
            }))}
        />
        {t("confirm-update")}
      </DialogModal>
    </>
  );
}
