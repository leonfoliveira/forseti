"use client";

import { useFindAllSubmissionsForMemberAction } from "@/app/_action/find-all-submissions-for-member-action";
import React, { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Table } from "@/app/_component/table/table";
import { TableSection } from "@/app/_component/table/table-section";
import { TableRow } from "@/app/_component/table/table-row";
import { TableCell } from "@/app/_component/table/table-cell";
import { toLocaleString } from "@/app/_util/date-utils";
import { formatLanguage } from "@/app/_util/contest-utils";
import { SubmissionStatusBadge } from "@/app/contests/[id]/_component/submission-status-badge";
import { attachmentService } from "@/app/_composition";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";
import { FileInput } from "@/app/_component/form/file-input";
import { Button } from "@/app/_component/form/button";
import { Form } from "@/app/_component/form/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { submissionFormSchema } from "@/app/contests/[id]/submissions/_form/submission-form-schema";
import { SubmissionFormType } from "@/app/contests/[id]/submissions/_form/submission-form-type";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";
import { useCreateSubmissionAction } from "@/app/_action/create-submission-action";
import { toInputDTO } from "@/app/contests/[id]/submissions/_form/submission-form-map";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { Language } from "@/core/domain/enumerate/Language";

const ACTIVE_LANGUAGE_KEY = "active-language";

export default function ContestSubmissionPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const authorization = useAuthorization();
  const {
    data: submissions,
    setData: setSubmissions,
    ...findAllSubmissionsForMemberAction
  } = useFindAllSubmissionsForMemberAction();
  const { data: contest, ...findContestByIdAction } =
    useFindContestByIdAction();
  const createSubmissionAction = useCreateSubmissionAction();

  const submissionForm = useForm<SubmissionFormType>({
    resolver: joiResolver(submissionFormSchema),
  });

  useEffect(() => {
    if (authorization) {
      findAllSubmissionsForMemberAction.act(id, authorization?.member.id);
    }
    async function init() {
      const contest = await findContestByIdAction.act(id);
      const activeLanguage = localStorage.getItem(
        ACTIVE_LANGUAGE_KEY,
      ) as Language | null;
      if (activeLanguage && contest?.languages.includes(activeLanguage)) {
        submissionForm.setValue("language", activeLanguage);
      }
    }
    init();
  }, [authorization]);

  async function onSubmit(data: SubmissionFormType) {
    const submission = await createSubmissionAction.act(
      contest!.id,
      toInputDTO(data),
    );
    if (submission) {
      setSubmissions((prev) => [...(prev || []), submission]);
      localStorage.setItem(ACTIVE_LANGUAGE_KEY, submission.language);
    }
  }

  if (
    findAllSubmissionsForMemberAction.isLoading ||
    findContestByIdAction.isLoading
  ) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableSection head>
          <TableRow>
            <TableCell header>Timestamp</TableCell>
            <TableCell header>Problem</TableCell>
            <TableCell header>Language</TableCell>
            <TableCell header align="right">
              Status
            </TableCell>
          </TableRow>
        </TableSection>
        <TableSection>
          {submissions?.map((submission) => (
            <TableRow
              key={submission.id}
              className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition"
              onClick={() => attachmentService.download(submission.code)}
            >
              <TableCell>{toLocaleString(submission.createdAt)}</TableCell>
              <TableCell>{submission.problem.title}</TableCell>
              <TableCell>{formatLanguage(submission.language)}</TableCell>
              <TableCell align="right" className="font-semibold">
                <SubmissionStatusBadge status={submission.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
      <hr className="my-10 border-gray-200" />
      <Form
        className="flex flex-col"
        onSubmit={submissionForm.handleSubmit(onSubmit)}
        disabled={
          findContestByIdAction.isLoading || createSubmissionAction.isLoading
        }
      >
        <Select
          fm={submissionForm}
          name="problemId"
          label="Problem"
          options={(contest?.problems || []).map((it, index) => ({
            value: it.id.toString(),
            label: `${index + 1}. ${it.title}`,
          }))}
        />
        <div className="flex w-full gap-5">
          <Select
            fm={submissionForm}
            name="language"
            label="Language"
            options={(contest?.languages || []).map((it) => ({
              value: it,
              label: formatLanguage(it),
            }))}
          />
          <FileInput
            fm={submissionForm}
            name="code"
            label="Code"
            containerClassName="flex-1"
          />
        </div>
        <Button type="submit" className="mx-auto mt-5">
          Submit
          <FontAwesomeIcon icon={faPaperPlane} className="ms-3" />
        </Button>
      </Form>
    </div>
  );
}
