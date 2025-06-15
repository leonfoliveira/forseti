"use client";

import React, { useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { storageService, submissionService } from "@/app/_composition";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { FileInput } from "@/app/_component/form/file-input";
import { Button } from "@/app/_component/form/button";
import { Form } from "@/app/_component/form/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { Language } from "@/core/domain/enumerate/Language";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { StorageService } from "@/core/service/StorageService";
import { useLoadableState } from "@/app/_util/loadable-state";
import { SubmissionFormType } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-type";
import { submissionFormSchema } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-schema";
import { toInputDTO } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-map";
import { SubmissionAnswerBadge } from "@/app/contests/[slug]/_component/badge/submission-answer-badge";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";
import { useAlert } from "@/app/_component/context/notification-context";
import { DownloadButton } from "@/app/contests/[slug]/_component/download-button";
import { TimestampDisplay } from "@/app/_component/timestamp-display";

export default function ContestantSubmissionPage() {
  const { contest } = useContest();
  const {
    contestant: { memberSubmissions, addSubmission },
  } = useContest();
  const createSubmissionState = useLoadableState();

  const alert = useAlert();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("contests.[slug].contestant.submissions");
  const s = useTranslations(
    "contests.[slug].contestant.submissions._form.submission-form",
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

    loadActiveLanguage();
  }, []);

  async function onCreateSubmission(data: SubmissionFormType) {
    createSubmissionState.start();
    try {
      const submission = await submissionService.createSubmission(
        toInputDTO(data),
      );
      addSubmission(submission);
      storageService.setKey(
        StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
        submission.language,
      );
      submissionForm.reset({ language: submission.language });
      alert.success(t("create-success"));
      createSubmissionState.finish();
    } catch (error) {
      createSubmissionState.fail(error, {
        default: () => alert.error(t("create-error")),
      });
    }
  }

  return (
    <div>
      <Form
        className="flex flex-col"
        onSubmit={submissionForm.handleSubmit(onCreateSubmission)}
        disabled={createSubmissionState.isLoading}
        data-testid="form:submission"
      >
        <Select
          form={submissionForm}
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
            form={submissionForm}
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
            form={submissionForm}
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
      <div className="divider mt-8" />
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header>{t("header-timestamp")}</TableCell>
            <TableCell header>{t("header-problem")}</TableCell>
            <TableCell header>{t("header-language")}</TableCell>
            <TableCell header align="right">
              {t("header-answer")}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {memberSubmissions?.map((submission) => (
            <TableRow key={submission.id} data-testid="submission:row">
              <TableCell data-testid="submission:created-at">
                <TimestampDisplay timestamp={submission.createdAt} />
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
                  <DownloadButton attachment={submission.code} />
                </fieldset>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      {memberSubmissions?.length === 0 ? (
        <div
          className="flex justify-center items-center py-20"
          data-testid="submissions:empty"
        >
          <p className="text-neutral-content">{t("submissions-empty")}</p>
        </div>
      ) : null}
    </div>
  );
}
