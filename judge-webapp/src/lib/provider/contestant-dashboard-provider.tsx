import React, { useEffect } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

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
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useErrorHandler } from "@/lib/util/error-handler-hook";
import { useAlert } from "@/store/slices/alerts-slice";
import { useAuthorization } from "@/store/slices/authorization-slice";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";
import { useToast } from "@/store/slices/toasts-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  loadError: {
    id: "lib.provider.contestant-dashboard-provider.load-error",
    defaultMessage: "Error loading contest data",
  },
  problemAnswer: {
    id: "lib.provider.contestant-dashboard-provider.problem-answer",
    defaultMessage: "Problem {letter}: {answer}",
  },
  announcement: {
    id: "lib.provider.contestant-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  clarificationAnswer: {
    id: "lib.provider.contestant-dashboard-provider.clarification-answer",
    defaultMessage: "New answer for a clarification",
  },
});

export function ContestantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAuthorization();
  const contestMetadata = useContestMetadata();
  const { isLoading, error } = useAppSelector(
    (state) => state.contestantDashboard,
  );
  const dispatch = useAppDispatch();
  const errorHandler = useErrorHandler();
  const alert = useAlert();
  const toast = useToast();
  const intl = useIntl();

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
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
          contestantDashboardSlice.actions.success({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
            memberSubmissions: data[3],
          }),
        );
      } catch (error) {
        errorHandler.handle(error as Error, {
          default: () =>
            dispatch(contestantDashboardSlice.actions.fail(error as Error)),
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
        answer: intl.formatMessage(
          globalMessages.submissionAnswer[submission.answer],
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

  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage />;
  }

  return children;
}
