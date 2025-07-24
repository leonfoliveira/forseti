import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import React, { createContext, useContext, useEffect } from "react";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { useAlert, useToast } from "@/app/_context/notification-context";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useLoadableState } from "@/app/_util/loadable-state";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { useTranslations } from "next-intl";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { merge } from "@/app/contests/[slug]/_util/entity-merger";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { findClarification } from "@/app/contests/[slug]/_util/clarification-finder";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useAuthorization } from "@/app/_context/authorization-context";

type ContestantContextType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
  memberSubmissions: SubmissionFullResponseDTO[];
  addMemberSubmission: (submission: SubmissionFullResponseDTO) => void;
};

const ContestantContext = createContext<ContestantContextType>({
  contest: {} as ContestPublicResponseDTO,
  leaderboard: {} as ContestLeaderboardResponseDTO,
  submissions: [],
  memberSubmissions: [],
  addMemberSubmission: () => {},
});

export function ContestantContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useLoadableState<ContestantContextType>({ isLoading: true });

  const { authorization } = useAuthorization();
  const contestMetadata = useContestMetadata();
  const alert = useAlert();
  const toast = useToast();
  const { formatSubmissionAnswer } = useContestFormatter();
  const t = useTranslations(
    "contests.[slug].contestant._context.contestant-context",
  );

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      state.start();
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          contestService.findContestLeaderboardById(contestMetadata.id),
          contestService.findAllContestSubmissions(contestMetadata.id),
          submissionService.findAllFullForMember(),
        ]);

        await listenerClient.connect();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClient,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveSubmission,
          ),
          submissionListener.subscribeForMember(
            listenerClient,
            authorization!.member.id,
            receiveMemberSubmission,
          ),
          announcementListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveAnnouncement,
          ),
          clarificationListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveClarification,
          ),
          clarificationListener.subscribeForMemberChildren(
            listenerClient,
            authorization!.member.id,
            receiveClarificationAnswer,
          ),
          clarificationListener.subscribeForContestDeleted(
            listenerClient,
            contestMetadata.id,
            deleteClarification,
          ),
        ]);

        state.finish({
          contest: data[0],
          leaderboard: data[1],
          submissions: data[2],
          memberSubmissions: data[3],
          addMemberSubmission,
        });
      } catch (error) {
        state.fail(error, {
          default: () => alert.error(t("error")),
        });
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, []);

  function addMemberSubmission(submission: SubmissionFullResponseDTO) {
    state.finish((prevState) => {
      prevState.memberSubmissions = merge(
        prevState.memberSubmissions,
        submission,
      );
      return {
        ...prevState,
      };
    });
  }

  function receiveLeaderboard(leaderboard: ContestLeaderboardResponseDTO) {
    state.finish((prevState) => {
      prevState.leaderboard = leaderboard;
      return { ...prevState };
    });
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    state.finish((prevState) => {
      prevState.submissions = merge(prevState.submissions, submission);
      return { ...prevState };
    });
  }

  function receiveMemberSubmission(submission: SubmissionPublicResponseDTO) {
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    state.finish((prevState) => {
      prevState.memberSubmissions = merge(
        prevState.memberSubmissions,
        submission as SubmissionFullResponseDTO,
      );
      return { ...prevState };
    });

    const text = t("submission-toast-problem", {
      letter: submission.problem.letter,
      answer: formatSubmissionAnswer(submission.answer),
    });

    switch (submission.answer) {
      case SubmissionAnswer.ACCEPTED: {
        toast.success(text);
        break;
      }
      case SubmissionAnswer.WRONG_ANSWER: {
        toast.error(text);
        break;
      }
      case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
      case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED: {
        toast.info(text);
        break;
      }
      case SubmissionAnswer.RUNTIME_ERROR:
      case SubmissionAnswer.COMPILATION_ERROR: {
        toast.warning(text);
        break;
      }
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    state.finish((prevState) => {
      prevState.contest.announcements = merge(
        prevState.contest.announcements,
        announcement,
      );
      return { ...prevState };
    });

    alert.warning(announcement.text);
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    state.finish((prevState) => {
      if (!clarification.parentId) {
        prevState.contest.clarifications = merge(
          prevState.contest.clarifications,
          clarification,
        );
      } else {
        const parent = findClarification(
          prevState.contest.clarifications,
          clarification.parentId,
        );
        if (parent) {
          parent.children = merge(parent.children, clarification);
        }
      }

      return {
        ...prevState,
      };
    });
  }

  function receiveClarificationAnswer() {
    toast.info(t("clarification-toast-text"));
  }

  function deleteClarification({ id }: { id: string }) {
    state.finish((prevState) => {
      prevState.contest.clarifications =
        prevState.contest.clarifications.filter((c) => c.id !== id);
      return { ...prevState };
    });
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <ContestantContext.Provider value={state.data!}>
      {children}
    </ContestantContext.Provider>
  );
}

export function useContestantContext() {
  return useContext(ContestantContext);
}
