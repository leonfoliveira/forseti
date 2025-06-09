import React, { createContext, useContext, useEffect } from "react";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { useFindAllContestSubmissionsAction } from "@/app/_action/find-all-contest-submissions-action";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { useSubscribeForContestSubmissionsAction } from "@/app/_action/subscribe-for-contest-submissions-action";
import { recalculateLeaderboard } from "@/app/contests/[slug]/_util/leaderboard-calculator";
import { useToast } from "@/app/_component/toast/toast-provider";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { LoadingPage } from "@/app/_component/loading-page";
import { ErrorPage } from "@/app/_component/error-page";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export const ContestContext = createContext({
  metadata: {} as WithStatus<ContestMetadataResponseDTO>,
  contest: {} as WithStatus<ContestPublicResponseDTO>,
  leaderboard: {} as ContestLeaderboardResponseDTO,
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
        contest: contest || ({} as ContestPublicResponseDTO),
        submissions: submissions || [],
      }}
    >
      {children}
    </ContestContext.Provider>
  );
}

export const useContest = () => useContext(ContestContext);
