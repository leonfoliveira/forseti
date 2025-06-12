"use client";

import React, { useEffect, useRef } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import {
  attachmentService,
  contestService,
  submissionService,
} from "@/app/_composition";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEdit,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useModal } from "@/app/_util/modal-hook";
import { useForm } from "react-hook-form";
import { UpdateSubmissionFormType } from "@/app/contests/[slug]/(dashboard)/submissions/_form/update-submission-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { updateSubmissionFormSchema } from "@/app/contests/[slug]/(dashboard)/submissions/_form/update-submission-form-schema";
import { Select } from "@/app/_component/form/select";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/(dashboard)/_component/submission-answer-badge";
import { useContest } from "@/app/_context/contest-context";
import { useLoadableState } from "@/app/_util/loadable-state";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { handleError } from "@/app/_util/error-handler";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { useAlert } from "@/app/_context/notification-context";

export default function JuryContestSubmissionPage() {
  const contest = useContest();
  const submissionsState = useLoadableState<SubmissionFullResponseDTO[]>();
  const rerunSubmissionState = useLoadableState();
  const updateSubmissionAnswerState = useLoadableState();
  const submissionLister = useRef<ListenerClient>(null);

  const alert = useAlert();
  const rerunModal = useModal<SubmissionFullResponseDTO>();
  const updateAnswerModal = useModal<SubmissionFullResponseDTO>();
  const { formatLanguage, formatSubmissionAnswer } = useContestFormatter();
  const t = useTranslations("contests.[slug].submissions");
  const s = useTranslations(
    "contests.[slug].submissions._form.update-submission-form-schema",
  );

  const updateSubmissionForm = useForm<UpdateSubmissionFormType>({
    resolver: joiResolver(updateSubmissionFormSchema),
  });

  useEffect(() => {
    async function loadSubmissions() {
      submissionsState.start();
      try {
        const submissions = await contestService.findAllContestFullSubmissions(
          contest.id,
        );
        submissionLister.current =
          await submissionService.subscribeForContestFull(
            contest.id,
            onSubmission,
          );
        submissionsState.finish(submissions);
      } catch (error) {
        submissionsState.fail(error);
        handleError(error, {
          [UnauthorizedException.name]: () =>
            redirect(routes.CONTEST_SIGN_IN(contest.slug)),
          [ForbiddenException.name]: () => redirect(routes.FORBIDDEN),
          default: () => alert.error(t("load-error")),
        });
      }
    }

    function onSubmission(submission: SubmissionFullResponseDTO) {
      submissionsState.finish((prevState) => {
        return recalculateSubmissions(
          prevState,
          submission,
        ) as SubmissionFullResponseDTO[];
      });
    }

    loadSubmissions();

    return () => {
      submissionLister.current?.unsubscribe();
    };
  }, []);

  async function onRerun(submission: SubmissionFullResponseDTO) {
    rerunSubmissionState.start();
    try {
      await submissionService.rerunSubmission(submission.id);
      rerunSubmissionState.finish();
      rerunModal.close();
    } catch (error) {
      rerunSubmissionState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () =>
          redirect(routes.CONTEST_SIGN_IN(contest.slug)),
        [ForbiddenException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("rerun-error")),
      });
    }
  }

  async function onUpdateAnswer(
    data: UpdateSubmissionFormType,
    submission: SubmissionFullResponseDTO,
  ) {
    console.log(data, submission);
    updateSubmissionAnswerState.start();
    try {
      await submissionService.updateSubmissionAnswer(submission.id, data);
      alert.success(t("update-answer-success"));
      updateSubmissionAnswerState.finish();
      updateAnswerModal.close();
    } catch (error) {
      updateSubmissionAnswerState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () =>
          redirect(routes.CONTEST_SIGN_IN(contest.slug)),
        [ForbiddenException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("update-error")),
      });
    }
  }

  return (
    <div>
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
          {submissionsState.data?.map((submission) => (
            <TableRow
              key={submission.id}
              className="hover:bg-base-200"
              data-testid="submission:row"
            >
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
                  <div className="tooltip" data-tip={t("tooltip-download")}>
                    <Button
                      onClick={() =>
                        attachmentService.download(submission.code)
                      }
                      className="text-xs h-5"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                  </div>
                  <div className="tooltip" data-tip={t("tooltip-rerun")}>
                    <Button
                      onClick={() => rerunModal.open(submission)}
                      disabled={submission.status === SubmissionStatus.JUDGING}
                      className="text-xs h-5"
                    >
                      <FontAwesomeIcon icon={faRotate} />
                    </Button>
                  </div>
                  <div className="tooltip" data-tip={t("tooltip-update")}>
                    <Button
                      onClick={() => updateAnswerModal.open(submission)}
                      disabled={submission.status === SubmissionStatus.JUDGING}
                      className="text-xs h-5"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                  </div>
                </fieldset>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {submissionsState.isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" data-testid="submissions:spinner" />
        </div>
      )}
      {submissionsState.data?.length === 0 ? (
        <div
          className="flex justify-center items-center py-20"
          data-testid="submissions:empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      ) : null}

      <DialogModal
        modal={rerunModal}
        onConfirm={(props) => onRerun(props!)}
        isLoading={rerunSubmissionState.isLoading}
        data-testid="rerun-modal"
      >
        <p className="py-4">{t("confirm-rerun-content")}</p>
      </DialogModal>

      <DialogModal
        modal={updateAnswerModal}
        onConfirm={(props) =>
          updateSubmissionForm.handleSubmit((data) =>
            onUpdateAnswer(data, props!),
          )()
        }
        isLoading={updateSubmissionAnswerState.isLoading}
        data-testid="update-answer-modal"
      >
        <Select
          fm={updateSubmissionForm}
          s={s}
          name="answer"
          label={t("answer:label")}
          options={Object.values(SubmissionAnswer)
            .filter((it) => it !== SubmissionAnswer.NO_ANSWER)
            .map((it) => ({
              value: it,
              label: formatSubmissionAnswer(it),
            }))}
        />
        <p className="py-4">{t("confirm-update-content")}</p>
      </DialogModal>
    </div>
  );
}
