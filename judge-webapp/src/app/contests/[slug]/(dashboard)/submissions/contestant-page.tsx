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
  storageService,
  submissionService,
} from "@/app/_composition";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { FileInput } from "@/app/_component/form/file-input";
import { Button } from "@/app/_component/form/button";
import { Form } from "@/app/_component/form/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEdit,
  faPaperPlane,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { submissionFormSchema } from "@/app/contests/[slug]/(dashboard)/submissions/_form/submission-form-schema";
import { SubmissionFormType } from "@/app/contests/[slug]/(dashboard)/submissions/_form/submission-form-type";
import { toInputDTO } from "@/app/contests/[slug]/(dashboard)/submissions/_form/submission-form-map";
import { Language } from "@/core/domain/enumerate/Language";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { StorageService } from "@/core/service/StorageService";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/(dashboard)/_component/submission-answer-badge";
import { useContest } from "@/app/_context/contest-context";
import { useLoadableState } from "@/app/_util/loadable-state";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { handleError } from "@/app/_util/error-handler";
import { useToast } from "@/app/_context/toast-context";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

export default function ContestantContestSubmissionPage() {
  const contest = useContest();
  const submissionsState = useLoadableState<SubmissionFullResponseDTO[]>();
  const createSubmissionState = useLoadableState();
  const submissionsListener = useRef<ListenerClient>(null);

  const toast = useToast();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[slug].submissions");
  const s = useTranslations(
    "contests.[slug].submissions._form.submission-form-schema",
  );

  const submissionForm = useForm<SubmissionFormType>({
    resolver: joiResolver(submissionFormSchema),
  });

  useEffect(() => {
    function loadActiveLanguage() {
      const activeLanguage = storageService.getKey(
        StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
      ) as Language | null;
      if (activeLanguage && contest.languages.includes(activeLanguage)) {
        submissionForm.setValue("language", activeLanguage);
      }
    }

    async function loadSubmissions() {
      submissionsState.start();
      try {
        const submissions = await submissionService.findAllFullForMember();
        submissionsListener.current =
          await submissionService.subscribeForContest(contest.id, onSubmission);
        submissionsState.finish(submissions);
      } catch (error) {
        submissionsState.fail(error);
        handleError(error, {
          [UnauthorizedException.name]: () =>
            redirect(routes.CONTEST_SIGN_IN(contest.slug)),
          [ForbiddenException.name]: () => redirect(routes.FORBIDDEN),
          default: () => toast.error(t("load-error")),
        });
      }
    }

    function onSubmission(submission: SubmissionPublicResponseDTO) {
      submissionsState.finish((prevState) => {
        return recalculateSubmissions(
          prevState,
          submission,
        ) as SubmissionFullResponseDTO[];
      });
    }

    loadActiveLanguage();
    loadSubmissions();
  }, []);

  async function onCreateSubmission(data: SubmissionFormType) {
    createSubmissionState.start();
    try {
      const submission = await submissionService.createSubmission(
        toInputDTO(data),
      );
      submissionsState.finish((prev) => [...(prev || []), submission]);
      storageService.setKey(
        StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
        submission.language,
      );
    } catch (error) {
      submissionsState.fail(error);
      handleError(error, {
        default: () => toast.error(t("create-error")),
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
      <div className="divider mt-8">{t("new:label")}</div>
      <Form
        className="flex flex-col"
        onSubmit={submissionForm.handleSubmit(onCreateSubmission)}
        disabled={createSubmissionState.isLoading}
        data-testid="form:submission"
      >
        <Select
          fm={submissionForm}
          name="problemId"
          s={s}
          label={t("problem:label")}
          options={(contest?.problems || []).map((it) => ({
            value: it.id.toString(),
            label: `${it.letter}. ${it.title}`,
          }))}
          className="w-full"
          data-testid="form:problem"
        />
        <div className="flex w-full gap-5">
          <Select
            fm={submissionForm}
            name="language"
            s={s}
            label={t("language:label")}
            options={(contest?.languages || []).map((it) => ({
              value: it,
              label: formatLanguage(it),
            }))}
            containerClassName="flex-1"
            data-testid="form:language"
          />
          <FileInput
            fm={submissionForm}
            name="code"
            s={s}
            label={t("code:label")}
            containerClassName="flex-2"
            data-testid="form:code"
          />
        </div>
        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            className="btn-primary"
            data-testid="form:submit"
            isLoading={createSubmissionState.isLoading}
          >
            {t("submit:label")}
            <FontAwesomeIcon icon={faPaperPlane} className="ms-3" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
