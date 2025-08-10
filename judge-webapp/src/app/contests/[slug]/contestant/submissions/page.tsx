"use client";

import React, { useEffect } from "react";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { problemService, storageService } from "@/config/composition";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { FileInput } from "@/app/_component/form/file-input";
import { Button } from "@/app/_component/form/button";
import { Form } from "@/app/_component/form/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { Language } from "@/core/domain/enumerate/Language";
import { StorageService } from "@/core/service/StorageService";
import { useLoadableState } from "@/app/_util/loadable-state";
import { SubmissionFormType } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form";
import { submissionFormSchema } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-schema";
import { SubmissionFormMap } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-map";
import { SubmissionAnswerBadge } from "@/app/_component/badge/submission-answer-badge";
import { useAlert } from "@/app/_context/notification-context";
import { DownloadButton } from "@/app/_component/form/download-button";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { defineMessages, FormattedMessage } from "react-intl";
import { globalMessages } from "@/i18n/global";

const messages = defineMessages({
  createSuccess: {
    id: "app.contests.[slug].contestant.submissions.page.create-success",
    defaultMessage: "Submission created successfully",
  },
  createError: {
    id: "app.contests.[slug].contestant.submissions.page.create-error",
    defaultMessage: "Error creating submission",
  },
  problemLabel: {
    id: "app.contests.[slug].contestant.submissions.page.problem-label",
    defaultMessage: "Problem",
  },
  problemOptionLabel: {
    id: "app.contests.[slug].contestant.submissions.page.problem-option-label",
    defaultMessage: "{letter}. {title}",
  },
  languageLabel: {
    id: "app.contests.[slug].contestant.submissions.page.language-label",
    defaultMessage: "Language",
  },
  codeLabel: {
    id: "app.contests.[slug].contestant.submissions.page.code-label",
    defaultMessage: "Code",
  },
  submit: {
    id: "app.contests.[slug].contestant.submissions.page.submit",
    defaultMessage: "Submit",
  },
  headerTimestamp: {
    id: "app.contests.[slug].contestant.submissions.page.header-timestamp",
    defaultMessage: "Timestamp",
  },
  headerProblem: {
    id: "app.contests.[slug].contestant.submissions.page.header-problem",
    defaultMessage: "Problem",
  },
  headerLanguage: {
    id: "app.contests.[slug].contestant.submissions.page.header-language",
    defaultMessage: "Language",
  },
  headerCode: {
    id: "app.contests.[slug].contestant.submissions.page.header-code",
    defaultMessage: "Code",
  },
  headerAnswer: {
    id: "app.contests.[slug].contestant.submissions.page.header-answer",
    defaultMessage: "Answer",
  },
  empty: {
    id: "app.contests.[slug].contestant.submissions.page.empty",
    defaultMessage: "No submissions yet",
  },
});

export default function ContestantSubmissionPage() {
  const { contest, memberSubmissions, addMemberSubmission } =
    useContestantContext();
  const createSubmissionState = useLoadableState();

  const alert = useAlert();

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
      const submission = await problemService.createSubmission(
        data.problemId as string,
        SubmissionFormMap.toInputDTO(data),
      );
      addMemberSubmission(submission);
      storageService.setKey(
        StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
        submission.language,
      );
      submissionForm.reset({ language: submission.language });
      alert.success(messages.createSuccess);
      createSubmissionState.finish();
    } catch (error) {
      createSubmissionState.fail(error, {
        default: () => alert.error(messages.createError),
      });
    }
  }

  return (
    <div>
      <Form
        className="flex flex-col"
        onSubmit={submissionForm.handleSubmit(onCreateSubmission)}
        disabled={createSubmissionState.isLoading}
        data-testid="form-submission"
      >
        <Select
          form={submissionForm}
          name="problemId"
          label={messages.problemLabel}
          options={(contest?.problems || []).map((it) => ({
            value: it.id.toString(),
            label: {
              ...messages.problemOptionLabel,
              values: { letter: it.letter, title: it.title },
            },
          }))}
          className="w-full"
          data-testid="form-problem"
        />
        <div className="flex w-full gap-5">
          <Select
            form={submissionForm}
            name="language"
            label={messages.languageLabel}
            options={(contest?.languages || []).map((it) => ({
              value: it,
              label: globalMessages.language[it],
            }))}
            containerClassName="flex-1"
            data-testid="form-language"
          />
          <FileInput
            form={submissionForm}
            name="code"
            label={messages.codeLabel}
            containerClassName="flex-2"
            data-testid="form-code"
          />
        </div>
        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            label={messages.submit}
            rightIcon={<FontAwesomeIcon icon={faPaperPlane} />}
            className="btn-primary"
            data-testid="form-submit"
            isLoading={createSubmissionState.isLoading}
          />
        </div>
      </Form>
      <div className="divider mt-8" />
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
            <TableCell header align="right" data-testid="header-answer">
              <FormattedMessage {...messages.headerAnswer} />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableSection>
        <TableSection>
          {memberSubmissions?.map((submission) => (
            <TableRow key={submission.id} data-testid="submission-row">
              <TableCell data-testid="submission-created-at">
                <FormattedDateTime timestamp={submission.createdAt} />
              </TableCell>
              <TableCell data-testid="submission-title">
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
                data-testid="submission-answer"
              >
                <SubmissionAnswerBadge answer={submission.answer} />
              </TableCell>
              <TableCell data-testid="submission-actions">
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
          data-testid="submissions-empty"
        >
          <p className="text-neutral-content">
            <FormattedMessage {...messages.empty} />
          </p>
        </div>
      ) : null}
    </div>
  );
}
