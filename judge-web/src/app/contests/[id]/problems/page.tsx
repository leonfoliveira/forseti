"use client";

import { useContainer } from "@/app/_atom/container-atom";
import React, { use, useEffect, useState } from "react";
import { ProblemShortResponseDTO } from "@/core/repository/dto/response/ProblemShortResponseDTO";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";
import { Modal } from "@/app/_component/modal";
import { Button } from "@/app/_component/form/button";
import { MarkdownDisplay } from "@/app/_component/markdown-display";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { Badge } from "@/app/_component/badge";
import { FileInput } from "@/app/_component/form/file-input";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { submissionFormSchema } from "@/app/contests/[id]/problems/_form/submission-form-schema";
import { SubmissionFormType } from "@/app/contests/[id]/problems/_form/submission-form-type";
import { toInputDTO } from "@/app/contests/[id]/problems/_form/submission-form-map";
import { Select } from "@/app/_component/form/select";
import { Language } from "@/core/domain/enumerate/Language";
import { formatLanguage } from "@/app/_util/contest-utils";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";
import { useCreateSubmissionAction } from "@/app/_action/create-submission-action";
import { Form } from "@/app/_component/form/form";

export default function ContestProblemsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { authorizationService } = useContainer();
  const { data: problems, ...findAllProblemsAction } =
    useFindAllProblemsAction();
  const { data: memberProblems, ...findAllProblemsForMemberAction } =
    useFindAllProblemsForMemberAction();
  const createSubmissionAction = useCreateSubmissionAction();

  const submissionForm = useForm<SubmissionFormType>({
    resolver: joiResolver(submissionFormSchema),
  });

  const [isContestant, setIsContestant] = useState(false);
  const [openProblem, setOpenProblem] = useState<
    ProblemShortResponseDTO | ProblemMemberResponseDTO | undefined
  >();

  useEffect(() => {
    const authorization = authorizationService.getAuthorization();
    const isContestant = authorization?.member?.type === MemberType.CONTESTANT;
    setIsContestant(isContestant);

    async function getProblems() {
      if (isContestant) {
        await findAllProblemsForMemberAction.act(id);
      } else {
        await findAllProblemsAction.act(id);
      }
    }
    getProblems();
  }, []);

  function makeSubmit(problemId: number) {
    return (data: SubmissionFormType) => {
      const input = toInputDTO(data);
      createSubmissionAction.act(id, problemId, input);
    };
  }

  if (
    findAllProblemsAction.isLoading ||
    findAllProblemsForMemberAction.isLoading
  ) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <ul>
        {isContestant
          ? memberProblems?.map((problem, index) => (
              <li
                key={problem.id}
                className={cls(
                  "p-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition flex justify-between",
                  index % 2 === 1 && "bg-gray-50",
                )}
                onClick={() => {
                  setOpenProblem(problem);
                }}
              >
                <p>{problem.title}</p>
                <div className="text-center">
                  {problem.isAccepted && (
                    <Badge variant="success">
                      AC
                      {problem.wrongSubmissions > 0 &&
                        `+${problem.wrongSubmissions}`}
                    </Badge>
                  )}
                  {!problem.isAccepted && problem.wrongSubmissions > 0 && (
                    <Badge variant="danger">+{problem.wrongSubmissions}</Badge>
                  )}
                </div>
              </li>
            ))
          : problems?.map((problem, index) => (
              <li
                key={problem.id}
                className={cls(
                  "p-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition flex justify-between",
                  index % 2 === 1 && "bg-gray-50",
                )}
                onClick={() => {
                  setOpenProblem(problem);
                }}
              >
                <p>{problem.title}</p>
              </li>
            ))}
      </ul>
      {openProblem && (
        <Modal>
          <div className="flex flex-col h-full p-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-300">
              <p className="text-lg font-semibold m-0">{openProblem.title}</p>
              <Button
                onClick={() => setOpenProblem(undefined)}
                disabled={createSubmissionAction.isLoading}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 py-2">
              <MarkdownDisplay markdown={openProblem.description} />
            </div>
            {isContestant && (
              <Form
                onSubmit={submissionForm.handleSubmit(
                  makeSubmit(openProblem.id),
                )}
                disabled={createSubmissionAction.isLoading}
                className="flex gap-5 items-center pt-2 border-t border-gray-300"
              >
                <div className="flex flex-1 gap-3">
                  <Select
                    fm={submissionForm}
                    label="Language"
                    name="language"
                    options={Object.values(Language).map((it) => ({
                      label: formatLanguage(it),
                      value: it,
                    }))}
                  />
                  <FileInput
                    fm={submissionForm}
                    label="Code"
                    name="code"
                    containerClassName="flex-1"
                  />
                </div>
                <div>
                  <Button type="submit" className="mt-[0.4em]">
                    Submit
                  </Button>
                  {createSubmissionAction.isLoading && (
                    <Spinner className="ms-4" />
                  )}
                </div>
              </Form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
