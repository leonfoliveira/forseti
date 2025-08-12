import React, { useEffect } from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { ErrorPage } from "@/app/_component/page/error-page";
import { LoadingPage } from "@/app/_component/page/loading-page";
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
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { useAlert } from "@/store/slices/alerts-slice";
import { useAuthorization } from "@/store/slices/authorization-slice";
import { useContest } from "@/store/slices/contest-metadata-slice";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";
import { useToast } from "@/store/slices/toasts-slice";
import { useAppDispatch } from "@/store/store";

const messages = defineMessages({
  loadError: {
    id: "app.contests.[slug].contestant._context.contestant-context.load-error",
    defaultMessage: "Error loading contest data",
  },
  problemAnswer: {
    id: "app.contests.[slug].contestant._context.contestant-context.problem-answer",
    defaultMessage: "Problem {letter}: {answer}",
  },
  announcement: {
    id: "app.contests.[slug].contestant._context.contestant-context.announcement",
    defaultMessage: "New announcement: {text}",
  },
  clarificationAnswer: {
    id: "app.contests.[slug].contestant._context.contestant-context.clarification-answer",
    defaultMessage: "New answer for a clarification",
  },
});

export function ContestantContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContest();
  const state = useLoadableState();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const toast = useToast();

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

        dispatch(
          contestantDashboardSlice.actions.set({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
            memberSubmissions: data[3],
          }),
        );
        state.finish();
      } catch (error) {
        state.fail(error, {
          default: () => alert.error(messages.loadError),
        });
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, []);

  function receiveLeaderboard(leaderboard: ContestLeaderboardResponseDTO) {
    dispatch(contestantDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    dispatch(contestantDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveMemberSubmission(submission: SubmissionPublicResponseDTO) {
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    dispatch(
      contestantDashboardSlice.actions.mergeMemberSubmission(
        submission as SubmissionFullResponseDTO,
      ),
    );

    const text = {
      ...messages.problemAnswer,
      values: {
        letter: submission.problem.letter,
        answer: (
          <FormattedMessage
            {...globalMessages.submissionAnswer[submission.answer]}
          />
        ),
      },
    };

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
    dispatch(contestantDashboardSlice.actions.mergeAnnouncement(announcement));
    alert.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(
      contestantDashboardSlice.actions.mergeClarification(clarification),
    );
  }

  function receiveClarificationAnswer() {
    toast.info(messages.clarificationAnswer);
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(contestantDashboardSlice.actions.deleteClarification(id));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return children;
}
