import React, { createContext, useContext, useEffect } from "react";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { useFindAllContestSubmissionsAction } from "@/app/_action/find-all-contest-submissions-action";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { useSubscribeForContestSubmissionsAction } from "@/app/_action/subscribe-for-contest-submissions-action";
import { recalculateContest } from "@/app/contests/[slug]/util/contest-calculator";
import { useToast } from "@/app/_component/toast/toast-provider";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { LoadingPage } from "@/app/_component/loading-page";
import { ErrorPage } from "@/app/_component/error-page";

export const ContestContext = createContext({
  contest: {} as ContestResponseDTO,
  submissions: [] as SubmissionPublicResponseDTO[],
});

export function ContestProvider({
  metadata,
  children,
}: {
  metadata: WithStatus<ContestMetadataResponseDTO>;
  children: React.ReactNode;
}) {
  const { data: contest, ...findContestByIdAction } =
    useFindContestByIdAction();
  const { data: submissions, ...findAllContestSubmissionsAction } =
    useFindAllContestSubmissionsAction();
  const subscribeForContestSubmissionsAction =
    useSubscribeForContestSubmissionsAction();

  const toast = useToast();
  const authorization = useAuthorization();
  const { formatSubmissionAnswer } = useContestFormatter();

  useEffect(() => {
    async function loadContest() {
      if (metadata && metadata.status !== ContestStatus.NOT_STARTED) {
        await Promise.all([
          findContestByIdAction.act(metadata.id),
          findAllContestSubmissionsAction.act(metadata.id),
          subscribeForContestSubmissionsAction.act(
            metadata.id,
            receiveSubmission,
          ),
        ]);
      }
    }
    loadContest();
  }, [metadata]);

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    findContestByIdAction.setData((data) =>
      !!data ? recalculateContest(data, submission) : data,
    );
    findAllContestSubmissionsAction.setData((data) => [
      ...(data || []),
      submission,
    ]);

    if (authorization?.member.id === submission.member.id) {
      switch (submission.answer) {
        case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
          return toast.info(formatSubmissionAnswer(submission.answer));
        case SubmissionAnswer.COMPILATION_ERROR:
        case SubmissionAnswer.RUNTIME_ERROR:
          return toast.warning(formatSubmissionAnswer(submission.answer));
        case SubmissionAnswer.WRONG_ANSWER:
          return toast.error(formatSubmissionAnswer(submission.answer));
      }
    }
  }

  if (
    findContestByIdAction.isLoading ||
    findAllContestSubmissionsAction.isLoading ||
    subscribeForContestSubmissionsAction.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    !!findContestByIdAction.error ||
    !!findAllContestSubmissionsAction.error
  ) {
    return <ErrorPage />;
  }

  return (
    <ContestContext.Provider
      value={{
        contest: contest || ({} as ContestResponseDTO),
        submissions: submissions || [],
      }}
    >
      {children}
    </ContestContext.Provider>
  );
}

export const useContest = () => useContext(ContestContext);
